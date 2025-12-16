'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppKitAccount } from '@reown/appkit/react';
import { BarChart3, ChevronDown, TrendingUp, TrendingDown, AlertTriangle, Clock, Check, Loader2, Trash2, Shield } from 'lucide-react';
import { TOKEN_LIST, TOKENS } from '@/config/contracts';

const durations = [
  { id: '1d', label: '1 Day', seconds: 86400 },
  { id: '7d', label: '7 Days', seconds: 604800 },
  { id: '14d', label: '14 Days', seconds: 1209600 },
  { id: '30d', label: '30 Days', seconds: 2592000 },
];

// Mock orders
const mockLimitOrders = [
  {
    id: 1,
    tokenIn: TOKENS.USDC,
    tokenOut: TOKENS.ETH,
    amountIn: '5000',
    targetPrice: '2200',
    currentPrice: '2450',
    expiry: Date.now() + 604800000,
    status: 'active',
  },
];

const mockStopLossOrders = [
  {
    id: 1,
    tokenIn: TOKENS.ETH,
    tokenOut: TOKENS.USDC,
    amountIn: '2.5',
    stopPrice: '2000',
    currentPrice: '2450',
    expiry: Date.now() + 1209600000,
    status: 'active',
  },
];

export default function LimitStopLossInterface() {
  const { address, isConnected } = useAppKitAccount();
  const [activeType, setActiveType] = useState('limit'); // 'limit' or 'stoploss'
  const [activeTab, setActiveTab] = useState('create');
  const [tokenIn, setTokenIn] = useState(TOKENS.USDC);
  const [tokenOut, setTokenOut] = useState(TOKENS.ETH);
  const [amountIn, setAmountIn] = useState('');
  const [targetPrice, setTargetPrice] = useState('');
  const [selectedDuration, setSelectedDuration] = useState('7d');
  const [showTokenSelect, setShowTokenSelect] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [limitOrders, setLimitOrders] = useState(mockLimitOrders);
  const [stopLossOrders, setStopLossOrders] = useState(mockStopLossOrders);

  const currentPrice = '2450'; // Mock current price

  const handleCreateOrder = async () => {
    if (!isConnected || !amountIn || !targetPrice) return;
    
    setIsLoading(true);
    setTimeout(() => {
      const newOrder = {
        id: Date.now(),
        tokenIn,
        tokenOut,
        amountIn,
        [activeType === 'limit' ? 'targetPrice' : 'stopPrice']: targetPrice,
        currentPrice,
        expiry: Date.now() + durations.find(d => d.id === selectedDuration).seconds * 1000,
        status: 'active',
      };

      if (activeType === 'limit') {
        setLimitOrders([newOrder, ...limitOrders]);
      } else {
        setStopLossOrders([newOrder, ...stopLossOrders]);
      }
      
      setIsLoading(false);
      setAmountIn('');
      setTargetPrice('');
      setActiveTab('orders');
    }, 2000);
  };

  const formatExpiry = (timestamp) => {
    const diff = timestamp - Date.now();
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    return `${days}d ${hours}h`;
  };

  const calculateDistance = (target, current, isLimit) => {
    const diff = isLimit
      ? ((parseFloat(current) - parseFloat(target)) / parseFloat(current)) * 100
      : ((parseFloat(target) - parseFloat(current)) / parseFloat(current)) * 100 * -1;
    return diff.toFixed(2);
  };

  const orders = activeType === 'limit' ? limitOrders : stopLossOrders;

  return (
    <div id={activeType === 'limit' ? 'limit' : 'stoploss'} className="relative">
      {/* Background effects */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-flow-purple/15 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-3xl p-6 relative overflow-hidden max-w-lg mx-auto"
      >
        {/* Type Toggle */}
        <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5">
          <button
            onClick={() => setActiveType('limit')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeType === 'limit'
                ? 'bg-gradient-to-r from-flow-green/80 to-flow-cyan/80 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <TrendingUp size={16} />
            Limit Order
          </button>
          <button
            onClick={() => setActiveType('stoploss')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeType === 'stoploss'
                ? 'bg-gradient-to-r from-red-500/80 to-orange-500/80 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            <Shield size={16} />
            Stop-Loss
          </button>
        </div>

        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          {activeType === 'limit' ? (
            <>
              <BarChart3 className="w-5 h-5 text-flow-green" />
              <h2 className="font-display font-semibold text-lg">Limit Order</h2>
            </>
          ) : (
            <>
              <Shield className="w-5 h-5 text-red-400" />
              <h2 className="font-display font-semibold text-lg">Stop-Loss</h2>
            </>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
              activeTab === 'create'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Create
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Orders
            {orders.filter(o => o.status === 'active').length > 0 && (
              <span className="w-5 h-5 rounded-full bg-flow-green/20 text-flow-green text-xs flex items-center justify-center">
                {orders.filter(o => o.status === 'active').length}
              </span>
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'create' ? (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
            >
              {/* Info Banner */}
              <div className={`p-3 rounded-xl mb-4 flex items-start gap-2 ${
                activeType === 'limit'
                  ? 'bg-flow-green/10 border border-flow-green/20'
                  : 'bg-red-500/10 border border-red-500/20'
              }`}>
                {activeType === 'limit' ? (
                  <>
                    <TrendingUp size={18} className="text-flow-green mt-0.5" />
                    <div className="text-sm">
                      <span className="font-medium text-flow-green">Buy Low:</span>
                      <span className="text-gray-400 ml-1">Order executes when price drops to your target</span>
                    </div>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={18} className="text-red-400 mt-0.5" />
                    <div className="text-sm">
                      <span className="font-medium text-red-400">Protect Position:</span>
                      <span className="text-gray-400 ml-1">Auto-sell if price falls below your stop</span>
                    </div>
                  </>
                )}
              </div>

              {/* Token Selection */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">
                    {activeType === 'limit' ? 'Spend' : 'Sell'}
                  </label>
                  <button
                    onClick={() => setShowTokenSelect('in')}
                    className="w-full token-select justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-base-blue/30 to-flow-cyan/30 flex items-center justify-center text-sm font-bold">
                        {tokenIn.symbol.charAt(0)}
                      </div>
                      <span className="font-semibold">{tokenIn.symbol}</span>
                    </div>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">
                    {activeType === 'limit' ? 'Buy' : 'Receive'}
                  </label>
                  <button
                    onClick={() => setShowTokenSelect('out')}
                    className="w-full token-select justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-flow-purple/30 to-flow-pink/30 flex items-center justify-center text-sm font-bold">
                        {tokenOut.symbol.charAt(0)}
                      </div>
                      <span className="font-semibold">{tokenOut.symbol}</span>
                    </div>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>
                </div>
              </div>

              {/* Amount */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-400">Amount</label>
                  <span className="text-xs text-gray-500">Balance: 0.00 {tokenIn.symbol}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={amountIn}
                    onChange={(e) => setAmountIn(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-2xl font-display font-semibold outline-none placeholder:text-gray-600"
                  />
                  <span className="text-gray-500 font-medium">{tokenIn.symbol}</span>
                </div>
              </div>

              {/* Target/Stop Price */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-400">
                    {activeType === 'limit' ? 'Target Price' : 'Stop Price'}
                  </label>
                  <span className="text-xs text-gray-500">
                    Current: ${currentPrice}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    value={targetPrice}
                    onChange={(e) => setTargetPrice(e.target.value)}
                    placeholder={activeType === 'limit' ? '2200' : '2000'}
                    className="flex-1 bg-transparent text-2xl font-display font-semibold outline-none placeholder:text-gray-600"
                  />
                  <span className="text-gray-500 text-sm">per {tokenOut.symbol}</span>
                </div>
                {targetPrice && (
                  <div className={`mt-2 text-sm flex items-center gap-1 ${
                    activeType === 'limit' ? 'text-flow-green' : 'text-red-400'
                  }`}>
                    {activeType === 'limit' ? (
                      <TrendingDown size={14} />
                    ) : (
                      <TrendingDown size={14} />
                    )}
                    <span>
                      {Math.abs(parseFloat(calculateDistance(targetPrice, currentPrice, activeType === 'limit'))).toFixed(2)}%
                      {activeType === 'limit' ? ' below current price' : ' below current price'}
                    </span>
                  </div>
                )}
              </div>

              {/* Duration Selection */}
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">Order Expiry</label>
                <div className="grid grid-cols-4 gap-2">
                  {durations.map((duration) => (
                    <button
                      key={duration.id}
                      onClick={() => setSelectedDuration(duration.id)}
                      className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
                        selectedDuration === duration.id
                          ? 'bg-base-blue/20 border border-base-blue/50 text-white'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white'
                      }`}
                    >
                      {duration.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Create Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleCreateOrder}
                disabled={!isConnected || !amountIn || !targetPrice || isLoading}
                className={`w-full py-4 rounded-2xl font-display font-semibold text-lg transition-all duration-300 ${
                  !isConnected || !amountIn || !targetPrice
                    ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                    : activeType === 'limit'
                    ? 'bg-gradient-to-r from-flow-green to-flow-cyan hover:shadow-lg hover:shadow-flow-green/30 text-white'
                    : 'bg-gradient-to-r from-red-500 to-orange-500 hover:shadow-lg hover:shadow-red-500/30 text-white'
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Order...
                  </span>
                ) : !isConnected ? (
                  'Connect Wallet'
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {activeType === 'limit' ? <TrendingUp size={18} /> : <Shield size={18} />}
                    Create {activeType === 'limit' ? 'Limit Order' : 'Stop-Loss'}
                  </span>
                )}
              </motion.button>
            </motion.div>
          ) : (
            <motion.div
              key="orders"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    {activeType === 'limit' ? (
                      <BarChart3 className="w-8 h-8 text-gray-500" />
                    ) : (
                      <Shield className="w-8 h-8 text-gray-500" />
                    )}
                  </div>
                  <h3 className="font-semibold mb-2">No Active Orders</h3>
                  <p className="text-gray-500 text-sm">
                    Create your first {activeType === 'limit' ? 'limit order' : 'stop-loss'} to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="order-card"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-base-blue/30 to-flow-cyan/30 flex items-center justify-center text-xs font-bold border-2 border-base-dark">
                              {order.tokenIn.symbol.charAt(0)}
                            </div>
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-flow-purple/30 to-flow-pink/30 flex items-center justify-center text-xs font-bold border-2 border-base-dark">
                              {order.tokenOut.symbol.charAt(0)}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-sm">
                              {order.amountIn} {order.tokenIn.symbol} → {order.tokenOut.symbol}
                            </div>
                            <div className="text-xs text-gray-500">
                              {activeType === 'limit' ? 'Buy' : 'Sell'} at ${order.targetPrice || order.stopPrice}
                            </div>
                          </div>
                        </div>
                        <span className={`badge ${activeType === 'limit' ? 'badge-active' : 'bg-red-500/15 text-red-400 border border-red-500/30'}`}>
                          Active
                        </span>
                      </div>

                      {/* Price info */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-white/5">
                          <div className="text-xs text-gray-500 mb-1">Target Price</div>
                          <div className="font-semibold text-sm">${order.targetPrice || order.stopPrice}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-white/5">
                          <div className="text-xs text-gray-500 mb-1">Current Price</div>
                          <div className="font-semibold text-sm">${order.currentPrice}</div>
                        </div>
                      </div>

                      {/* Distance & Expiry */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2 text-sm">
                          {activeType === 'limit' ? (
                            <TrendingDown size={14} className="text-flow-green" />
                          ) : (
                            <TrendingDown size={14} className="text-red-400" />
                          )}
                          <span className={activeType === 'limit' ? 'text-flow-green' : 'text-red-400'}>
                            {Math.abs(parseFloat(calculateDistance(
                              order.targetPrice || order.stopPrice,
                              order.currentPrice,
                              activeType === 'limit'
                            )))}% away
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock size={12} />
                            Expires: {formatExpiry(order.expiry)}
                          </span>
                          <button className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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
              className="glass-card rounded-3xl p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="font-display font-semibold text-lg mb-4">Select Token</h3>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {TOKEN_LIST.map((token) => (
                  <button
                    key={token.address}
                    onClick={() => {
                      if (showTokenSelect === 'in') {
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
