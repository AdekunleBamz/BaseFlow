'use client';

import { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppKitAccount } from '@reown/appkit/react';
import { useBalance, useReadContract, useSendTransaction, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { ArrowDownUp, Settings, ChevronDown, Loader2, Zap, TrendingUp, AlertCircle, Check } from 'lucide-react';
import { ERC20_ABI, TOKEN_LIST, TOKENS, DEX_ROUTERS } from '@/config/contracts';
import { formatUnits, parseUnits } from 'viem';

const dexOptions = [
  { id: 'auto', name: 'Best Rate (Auto)', icon: '⚡' },
  { id: 'uniswap', name: 'Uniswap V3', icon: '🦄', router: DEX_ROUTERS.uniswapV3 },
  { id: 'aerodrome', name: 'Aerodrome', icon: '✈️', router: DEX_ROUTERS.aerodrome },
  { id: 'baseswap', name: 'BaseSwap', icon: '🔄', router: DEX_ROUTERS.baseSwap },
  { id: 'sushi', name: 'SushiSwap', icon: '🍣', router: DEX_ROUTERS.sushiswap },
];

const BASE_CHAIN_ID = 8453;
const BASE_WETH = '0x4200000000000000000000000000000000000006';

function toLlamaTokenAddress(token) {
  if (!token?.address) return BASE_WETH;
  if (token.address === '0x0000000000000000000000000000000000000000') return BASE_WETH;
  return token.address;
}

async function fetchLlamaSpotQuote({ tokenIn, tokenOut, amountIn }) {
  // Uses DefiLlama token prices as a fallback when the router is unavailable.
  // This is a spot-price estimate (no route/gas), but avoids showing nonsense numbers.
  const inAddr = toLlamaTokenAddress(tokenIn);
  const outAddr = toLlamaTokenAddress(tokenOut);
  const url = `https://coins.llama.fi/prices/current/base:${inAddr},base:${outAddr}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Price fallback failed (${res.status})`);
  const data = await res.json();
  const inPrice = data?.coins?.[`base:${inAddr}`]?.price;
  const outPrice = data?.coins?.[`base:${outAddr}`]?.price;
  if (!inPrice || !outPrice) throw new Error('Price fallback missing token price');
  const out = (Number(amountIn) * Number(inPrice)) / Number(outPrice);
  return out;
}

export default function SwapInterface() {
  const { address, isConnected } = useAppKitAccount();
  const [tokenIn, setTokenIn] = useState(TOKENS.ETH);
  const [tokenOut, setTokenOut] = useState(TOKENS.USDC);
  const [amountIn, setAmountIn] = useState('');
  const [amountOut, setAmountOut] = useState('');
  const [slippage, setSlippage] = useState('0.5');
  const [selectedDex, setSelectedDex] = useState('auto');
  const [showSettings, setShowSettings] = useState(false);
  const [showTokenSelect, setShowTokenSelect] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [txStatus, setTxStatus] = useState(null);
  const [quoteError, setQuoteError] = useState('');
  const [swapTx, setSwapTx] = useState(null); // { to, data, value, allowanceTarget, sources[] }
  const [usd, setUsd] = useState({ inUsd: null, outUsd: null });

  const isNative = (t) => t?.address === '0x0000000000000000000000000000000000000000';
  const tokenInAddr = isNative(tokenIn) ? 'ETH' : tokenIn.address;
  const tokenOutAddr = isNative(tokenOut) ? 'ETH' : tokenOut.address;

  const { sendTransactionAsync, data: swapHash, isPending: swapSending } = useSendTransaction();
  const { writeContractAsync } = useWriteContract();
  const { isLoading: swapConfirming } = useWaitForTransactionReceipt({ hash: swapHash });

  const { data: allowance } = useReadContract({
    address: !isNative(tokenIn) ? tokenIn.address : undefined,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: address && !isNative(tokenIn) && swapTx?.allowanceTarget ? [address, swapTx.allowanceTarget] : undefined,
    query: { enabled: Boolean(address && !isNative(tokenIn) && swapTx?.allowanceTarget) },
  });

  const {
    data: tokenInBalance,
    isLoading: tokenInBalanceLoading,
  } = useBalance({
    address: isConnected ? address : undefined,
    token: !isNative(tokenIn) ? tokenIn.address : undefined,
    query: {
      enabled: Boolean(isConnected && address && tokenIn?.address),
      refetchInterval: 15_000,
    },
  });

  const {
    data: tokenOutBalance,
    isLoading: tokenOutBalanceLoading,
  } = useBalance({
    address: isConnected ? address : undefined,
    token: !isNative(tokenOut) ? tokenOut.address : undefined,
    query: {
      enabled: Boolean(isConnected && address && tokenOut?.address),
      refetchInterval: 15_000,
    },
  });

  const formatBalance = (b) => {
    if (!b) return '0.00';
    const v = Number(b.formatted);
    if (!Number.isFinite(v)) return '0.00';
    if (v === 0) return '0.00';
    if (v < 0.0001) return '<0.0001';
    if (v < 1) return v.toFixed(4);
    return v.toFixed(2);
  };

  // Real quote fetching (Base mainnet) via 0x Swap API (gives calldata + router sources).
  useEffect(() => {
    if (amountIn && parseFloat(amountIn) > 0) {
      setIsLoading(true);
      const timer = setTimeout(() => {
        (async () => {
          try {
            setQuoteError('');
            setSwapTx(null);

            // If tokens are the same, output equals input
            if (tokenIn.address === tokenOut.address) {
              setQuotes([]);
              setAmountOut(amountIn);
              return;
            }

            const amountInWei = parseUnits(amountIn, tokenIn.decimals);

            const params = new URLSearchParams({
              sellToken: tokenInAddr,
              buyToken: tokenOutAddr,
              sellAmount: amountInWei.toString(),
              slippagePercentage: String((Number(slippage || '0.5') / 100).toFixed(4)),
              takerAddress: address || '',
            });

            // 0x Swap API on Base (public). If this endpoint changes, we can swap to another quote provider.
            const res = await fetch(`https://base.api.0x.org/swap/v1/quote?${params.toString()}`);
            const data = await res.json();
            if (!res.ok) throw new Error(data?.reason || data?.validationErrors?.[0]?.reason || 'Error getting quote');

            const outWei = BigInt(data.buyAmount);
            const outFormatted = formatUnits(outWei, tokenOut.decimals);
            setAmountOut(outFormatted);

            // Source breakdown -> pick top by proportion
            const sources = Array.isArray(data.sources) ? data.sources : [];
            const bestSource = sources
              .filter((s) => Number(s?.proportion) > 0)
              .sort((a, b) => Number(b.proportion) - Number(a.proportion))[0];

            const bestQuote = {
              dex: bestSource?.name || '0x',
              name: bestSource?.name ? `Best price via ${bestSource.name}` : 'Best price (0x)',
              icon: '⚡',
              amountOut: outFormatted,
              gasEstimate: data.estimatedGas ? (Number(data.estimatedGas) / 1e6).toFixed(6) : '—',
              priceImpact: '—',
            };

            setQuotes([bestQuote]);
            setSelectedDex('auto');
            setSwapTx({
              to: data.to,
              data: data.data,
              value: data.value || '0',
              allowanceTarget: data.allowanceTarget,
              sources,
            });

            // USD equivalents via DefiLlama
            try {
              const inAddr = toLlamaTokenAddress(tokenIn);
              const outAddr2 = toLlamaTokenAddress(tokenOut);
              const url = `https://coins.llama.fi/prices/current/base:${inAddr},base:${outAddr2}`;
              const pr = await fetch(url).then((r) => r.json());
              const inPrice = pr?.coins?.[`base:${inAddr}`]?.price;
              const outPrice = pr?.coins?.[`base:${outAddr2}`]?.price;
              setUsd({
                inUsd: inPrice ? Number(amountIn) * Number(inPrice) : null,
                outUsd: outPrice ? Number(outFormatted) * Number(outPrice) : null,
              });
            } catch {
              setUsd({ inUsd: null, outUsd: null });
            }
          } catch (e) {
            // Fallback to spot price estimate if quote provider is temporarily unavailable
            try {
              const out = await fetchLlamaSpotQuote({ tokenIn, tokenOut, amountIn });
              const outFormatted = String(out);
              setAmountOut(outFormatted);
              setQuotes([
                {
                  dex: 'llama',
                  name: 'Spot estimate (fallback)',
                  icon: 'ℹ️',
                  amountOut: outFormatted,
                  gasEstimate: '—',
                  priceImpact: '—',
                },
              ]);
              setQuoteError('Quote provider unavailable; showing spot estimate (cannot swap)');
              setSwapTx(null);
            } catch (fallbackErr) {
              setQuoteError(e?.message || 'Failed to fetch quote');
              setQuotes([]);
              setAmountOut('');
              setSwapTx(null);
            }
          } finally {
            setIsLoading(false);
          }
        })();
      }, 500);
      
      return () => clearTimeout(timer);
    } else {
      setAmountOut('');
      setQuotes([]);
      setQuoteError('');
    }
  }, [amountIn, tokenIn, tokenOut, slippage]);

  const switchTokens = () => {
    const temp = tokenIn;
    setTokenIn(tokenOut);
    setTokenOut(temp);
    setAmountIn(amountOut);
  };

  const handleSwap = async () => {
    if (!isConnected || !swapTx) return;
    setTxStatus('pending');
    try {
      const sellAmountWei = parseUnits(amountIn, tokenIn.decimals);

      // Approval if ERC20
      if (!isNative(tokenIn)) {
        const currentAllowance = allowance ?? 0n;
        if (currentAllowance < sellAmountWei) {
          await writeContractAsync({
            address: tokenIn.address,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [swapTx.allowanceTarget, sellAmountWei],
          });
        }
      }

      await sendTransactionAsync({
        to: swapTx.to,
        data: swapTx.data,
        value: BigInt(swapTx.value || '0'),
      });

      setTxStatus('success');
      setTimeout(() => setTxStatus(null), 3000);
    } catch (e) {
      setTxStatus('error');
      setQuoteError(e?.shortMessage || e?.message || 'Swap failed');
      setTimeout(() => setTxStatus(null), 3000);
    }
  };

  const TokenSelector = ({ token, onSelect, label }) => (
    <div className="relative">
      <label className="text-xs text-gray-500 mb-1 block">{label}</label>
      <button
        onClick={() => setShowTokenSelect(label)}
        className="token-select group"
      >
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-base-blue/30 to-flow-cyan/30 flex items-center justify-center text-sm font-bold">
          {token.symbol.charAt(0)}
        </div>
        <span className="font-semibold">{token.symbol}</span>
        <ChevronDown size={14} className="text-gray-500 group-hover:text-white transition-colors" />
      </button>
    </div>
  );

  return (
    <div id="swap" className="relative">
      {/* Background glow effects */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-base-blue/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-flow-purple/20 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card rounded-3xl p-6 relative overflow-hidden max-w-lg mx-auto"
      >
        {/* Card header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-flow-cyan" />
            <h2 className="font-display font-semibold text-lg">Swap</h2>
          </div>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-2 rounded-lg transition-all duration-200 ${
              showSettings ? 'bg-base-blue/20 text-base-blue' : 'hover:bg-white/5 text-gray-400 hover:text-white'
            }`}
          >
            <Settings size={18} />
          </button>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mb-4 overflow-hidden"
            >
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                <label className="text-sm text-gray-400 mb-2 block">Slippage Tolerance</label>
                <div className="flex gap-2">
                  {['0.1', '0.5', '1.0'].map((val) => (
                    <button
                      key={val}
                      onClick={() => setSlippage(val)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        slippage === val
                          ? 'bg-base-blue text-white'
                          : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                  <div className="relative flex-1">
                    <input
                      type="number"
                      value={slippage}
                      onChange={(e) => setSlippage(e.target.value)}
                      className="input-glass w-full pr-8 text-right"
                      placeholder="Custom"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">%</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Token In */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-2">
          <div className="flex justify-between items-start mb-3">
            <TokenSelector token={tokenIn} label="You Pay" />
            <div className="text-right">
              <span className="text-xs text-gray-500">
                Balance:{' '}
                {isConnected
                  ? (tokenInBalanceLoading ? '…' : formatBalance(tokenInBalance))
                  : '—'}
              </span>
              {usd.inUsd != null && (
                <div className="text-xs text-gray-600 mt-0.5">${usd.inUsd.toFixed(2)}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <input
              type="number"
              value={amountIn}
              onChange={(e) => setAmountIn(e.target.value)}
              placeholder="0.0"
              className="flex-1 bg-transparent text-3xl font-display font-semibold outline-none placeholder:text-gray-600"
            />
            <div className="flex gap-2">
              <button className="px-2 py-1 text-xs rounded-lg bg-base-blue/20 text-base-blue font-medium hover:bg-base-blue/30 transition-colors">
                MAX
              </button>
            </div>
          </div>
        </div>

        {/* Switch Button */}
        <div className="flex justify-center -my-3 relative z-10">
          <motion.button
            whileHover={{ scale: 1.1, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={switchTokens}
            className="p-3 rounded-xl bg-base-dark border-4 border-base-dark glass-card hover:border-base-blue/50 transition-all duration-300"
          >
            <ArrowDownUp size={18} className="text-gray-400" />
          </motion.button>
        </div>

        {/* Token Out */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mt-2">
          <div className="flex justify-between items-start mb-3">
            <TokenSelector token={tokenOut} label="You Receive" />
            <div className="text-right">
              <span className="text-xs text-gray-500">
                Balance:{' '}
                {isConnected
                  ? (tokenOutBalanceLoading ? '…' : formatBalance(tokenOutBalance))
                  : '—'}
              </span>
              {usd.outUsd != null && (
                <div className="text-xs text-gray-600 mt-0.5">${usd.outUsd.toFixed(2)}</div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Fetching best rate...</span>
              </div>
            ) : (
              <input
                type="text"
                value={amountOut}
                readOnly
                placeholder="0.0"
                className="flex-1 bg-transparent text-3xl font-display font-semibold outline-none placeholder:text-gray-600 text-flow-cyan"
              />
            )}
          </div>
        </div>

        {/* Route */}
        {(quoteError || quotes.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-2xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Route</span>
              {quotes.length > 0 ? (
                <span className="text-xs text-flow-green flex items-center gap-1">
                  <TrendingUp size={12} />
                  Best price via {quotes[0].name}
                </span>
              ) : (
                <span className="text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle size={12} />
                  {quoteError}
                </span>
              )}
            </div>
            <div className="space-y-2">
              {quotes.slice(0, 1).map((quote) => (
                <button
                  key={quote.dex}
                  onClick={() => setSelectedDex('auto')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    true
                      ? 'bg-base-blue/20 border border-base-blue/50'
                      : 'bg-white/5 border border-transparent hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{quote.icon}</span>
                    <div className="text-left">
                      <div className="font-medium text-sm">{quote.name}</div>
                      <div className="text-xs text-gray-500">
                        {swapTx?.sources?.length ? `Route uses: ${swapTx.sources.filter(s=>Number(s.proportion)>0).map(s=>s.name).slice(0,3).join(', ')}` : '—'}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{Number(quote.amountOut).toFixed(6)} {tokenOut.symbol}</div>
                    <div className="text-xs text-gray-500">{quote.priceImpact}% impact</div>
                  </div>
                  <Check size={16} className="text-flow-green ml-2" />
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Swap Button */}
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          onClick={handleSwap}
          disabled={!isConnected || !amountIn || isLoading || !swapTx}
          className={`w-full mt-4 py-4 rounded-2xl font-display font-semibold text-lg transition-all duration-300 ${
            !isConnected
              ? 'bg-white/10 text-gray-500 cursor-not-allowed'
              : !swapTx
              ? 'bg-white/10 text-gray-500 cursor-not-allowed'
              : txStatus === 'pending'
              ? 'bg-flow-purple/50 text-white cursor-wait'
              : txStatus === 'success'
              ? 'bg-flow-green/50 text-white'
              : 'bg-gradient-to-r from-base-blue to-base-light hover:shadow-lg hover:shadow-base-blue/30 text-white'
          }`}
        >
          {!isConnected ? (
            'Connect Wallet'
          ) : !swapTx ? (
            'Quote unavailable'
          ) : txStatus === 'pending' ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              Swapping...
            </span>
          ) : txStatus === 'success' ? (
            <span className="flex items-center justify-center gap-2">
              <Check className="w-5 h-5" />
              Swap Successful!
            </span>
          ) : !amountIn ? (
            'Enter Amount'
          ) : (
            'Swap'
          )}
        </motion.button>

        {/* Info Row */}
        {amountIn && amountOut && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-sm">
            <div className="flex justify-between text-gray-400">
              <span>Rate</span>
              <span className="text-white">
                1 {tokenIn.symbol} ≈ {(parseFloat(amountOut) / parseFloat(amountIn)).toFixed(6)} {tokenOut.symbol}
              </span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Fee (0.3%)</span>
              <span className="text-white">{(parseFloat(amountIn) * 0.003).toFixed(6)} {tokenIn.symbol}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Min. Received</span>
              <span className="text-white">
                {(parseFloat(amountOut) * (1 - parseFloat(slippage) / 100)).toFixed(2)} {tokenOut.symbol}
              </span>
            </div>
          </div>
        )}
      </motion.div>

      {/* Token Select Modal */}
      <AnimatePresence>
        {showTokenSelect && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowTokenSelect(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-card rounded-3xl p-6 w-full max-w-md max-h-[70vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display font-semibold text-lg mb-4">Select Token</h3>
              <input
                type="text"
                placeholder="Search by name or address"
                className="input-glass mb-4"
              />
              <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2">
                {TOKEN_LIST.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => {
                      if (showTokenSelect === 'You Pay') {
                        setTokenIn(token);
                      } else {
                        setTokenOut(token);
                      }
                      setShowTokenSelect(null);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-base-blue/30 to-flow-cyan/30 flex items-center justify-center text-lg font-bold">
                      {token.symbol.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{token.symbol}</div>
                      <div className="text-sm text-gray-500">{token.name}</div>
                    </div>
                    <div className="text-right text-gray-400 text-sm">0.00</div>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
