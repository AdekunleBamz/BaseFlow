'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppKitAccount } from '@reown/appkit/react';
import { Clock, ChevronDown, Calendar, Repeat, TrendingUp, AlertCircle, Check, Loader2, Play, Pause, Trash2 } from 'lucide-react';
import { TOKEN_LIST, TOKENS } from '@/config/contracts';

const intervals = [
  { id: 'hourly', label: 'Every Hour', seconds: 3600 },
  { id: 'daily', label: 'Daily', seconds: 86400 },
  { id: 'weekly', label: 'Weekly', seconds: 604800 },
  { id: 'biweekly', label: 'Bi-Weekly', seconds: 1209600 },
  { id: 'monthly', label: 'Monthly', seconds: 2592000 },
];

// Mock active orders
const mockOrders = [
  {
    id: 1,
    tokenIn: TOKENS.ETH,
    tokenOut: TOKENS.USDC,
    amountPerInterval: '0.1',
    interval: 'daily',
    totalIntervals: 30,
    completedIntervals: 12,
    status: 'active',
    nextExecution: Date.now() + 43200000,
    totalInvested: '1.2',
    totalReceived: '3024.50',
  },
  {
    id: 2,
    tokenIn: TOKENS.USDC,
    tokenOut: TOKENS.DEGEN,
    amountPerInterval: '50',
    interval: 'weekly',
    totalIntervals: 12,
    completedIntervals: 4,
    status: 'active',
    nextExecution: Date.now() + 259200000,
    totalInvested: '200',
    totalReceived: '125000',
  },
];

export default function DCAInterface() {
  const { address, isConnected } = useAppKitAccount();
  const [tokenIn, setTokenIn] = useState(TOKENS.ETH);
  const [tokenOut, setTokenOut] = useState(TOKENS.USDC);
  const [totalAmount, setTotalAmount] = useState('');
  const [numIntervals, setNumIntervals] = useState('30');
  const [selectedInterval, setSelectedInterval] = useState('daily');
  const [showTokenSelect, setShowTokenSelect] = useState(null);
  const [activeTab, setActiveTab] = useState('create');
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState(mockOrders);

  const amountPerInterval = totalAmount && numIntervals
    ? (parseFloat(totalAmount) / parseInt(numIntervals)).toFixed(6)
    : '0';

  const handleCreateOrder = async () => {
    if (!isConnected || !totalAmount) return;
    
    setIsLoading(true);
    // Simulate transaction
    setTimeout(() => {
      setOrders([
        {
          id: orders.length + 1,
          tokenIn,
          tokenOut,
          amountPerInterval,
          interval: selectedInterval,
          totalIntervals: parseInt(numIntervals),
          completedIntervals: 0,
          status: 'active',
          nextExecution: Date.now() + intervals.find(i => i.id === selectedInterval).seconds * 1000,
          totalInvested: '0',
          totalReceived: '0',
        },
        ...orders,
      ]);
      setIsLoading(false);
      setTotalAmount('');
      setActiveTab('orders');
    }, 2000);
  };

  const formatTime = (timestamp) => {
    const diff = timestamp - Date.now();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  return (
    <div id="dca" className="relative">
      {/* Background effects */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-flow-cyan/15 rounded-full blur-[100px] pointer-events-none" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card rounded-3xl p-6 relative overflow-hidden max-w-lg mx-auto"
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-flow-cyan" />
          <h2 className="font-display font-semibold text-lg">DCA Strategy</h2>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 p-1 rounded-xl bg-white/5">
          <button
            onClick={() => setActiveTab('create')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all ${
              activeTab === 'create'
                ? 'bg-gradient-to-r from-base-blue to-base-light text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Create Order
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-gradient-to-r from-base-blue to-base-light text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            My Orders
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
              {/* Token Selection */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-gray-500 mb-2 block">Spend Token</label>
                  <button
                    onClick={() => setShowTokenSelect('spend')}
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
                  <label className="text-xs text-gray-500 mb-2 block">Buy Token</label>
                  <button
                    onClick={() => setShowTokenSelect('buy')}
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

              {/* Total Amount */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-400">Total Amount</label>
                  <span className="text-xs text-gray-500">Balance: 0.00 {tokenIn.symbol}</span>
                </div>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    placeholder="0.0"
                    className="flex-1 bg-transparent text-2xl font-display font-semibold outline-none placeholder:text-gray-600"
                  />
                  <span className="text-gray-500 font-medium">{tokenIn.symbol}</span>
                </div>
              </div>

              {/* Interval Selection */}
              <div className="mb-4">
                <label className="text-sm text-gray-400 mb-2 block">Buy Frequency</label>
                <div className="grid grid-cols-3 gap-2">
                  {intervals.slice(0, 3).map((interval) => (
                    <button
                      key={interval.id}
                      onClick={() => setSelectedInterval(interval.id)}
                      className={`py-3 px-3 rounded-xl text-sm font-medium transition-all ${
                        selectedInterval === interval.id
                          ? 'bg-base-blue/20 border border-base-blue/50 text-white'
                          : 'bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                      }`}
                    >
                      {interval.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Number of Intervals */}
              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <label className="text-sm text-gray-400">Number of Purchases</label>
                </div>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="2"
                    max="365"
                    value={numIntervals}
                    onChange={(e) => setNumIntervals(e.target.value)}
                    className="flex-1 accent-base-blue"
                  />
                  <div className="w-20 text-center">
                    <input
                      type="number"
                      value={numIntervals}
                      onChange={(e) => setNumIntervals(e.target.value)}
                      className="w-full bg-transparent text-lg font-semibold text-center outline-none"
                    />
                    <span className="text-xs text-gray-500">times</span>
                  </div>
                </div>
              </div>

              {/* Summary */}
              {totalAmount && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded-2xl bg-gradient-to-r from-base-blue/10 to-flow-cyan/10 border border-base-blue/20 mb-4"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Calendar className="w-4 h-4 text-flow-cyan" />
                    <span className="text-sm font-medium text-flow-cyan">Strategy Summary</span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Amount per purchase</span>
                      <span className="font-semibold">{amountPerInterval} {tokenIn.symbol}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Duration</span>
                      <span className="font-semibold">
                        {selectedInterval === 'daily' && `${numIntervals} days`}
                        {selectedInterval === 'hourly' && `${numIntervals} hours`}
                        {selectedInterval === 'weekly' && `${numIntervals} weeks`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Automation fee</span>
                      <span className="font-semibold">0.5% per execution</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Create Button */}
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleCreateOrder}
                disabled={!isConnected || !totalAmount || isLoading}
                className={`w-full py-4 rounded-2xl font-display font-semibold text-lg transition-all duration-300 ${
                  !isConnected || !totalAmount
                    ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-base-blue to-flow-cyan hover:shadow-lg hover:shadow-flow-cyan/30 text-white'
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
                    <Repeat size={18} />
                    Create DCA Order
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
                    <Clock className="w-8 h-8 text-gray-500" />
                  </div>
                  <h3 className="font-semibold mb-2">No Active Orders</h3>
                  <p className="text-gray-500 text-sm">Create your first DCA strategy to get started</p>
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
                              {order.tokenIn.symbol} → {order.tokenOut.symbol}
                            </div>
                            <div className="text-xs text-gray-500">
                              {order.amountPerInterval} {order.tokenIn.symbol} / {order.interval}
                            </div>
                          </div>
                        </div>
                        <span className="badge badge-active">Active</span>
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-500">Progress</span>
                          <span className="text-gray-400">{order.completedIntervals}/{order.totalIntervals}</span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-base-blue to-flow-cyan"
                            style={{ width: `${(order.completedIntervals / order.totalIntervals) * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="p-2 rounded-lg bg-white/5">
                          <div className="text-xs text-gray-500 mb-1">Invested</div>
                          <div className="font-semibold text-sm">{order.totalInvested} {order.tokenIn.symbol}</div>
                        </div>
                        <div className="p-2 rounded-lg bg-white/5">
                          <div className="text-xs text-gray-500 mb-1">Received</div>
                          <div className="font-semibold text-sm text-flow-green">{order.totalReceived} {order.tokenOut.symbol}</div>
                        </div>
                      </div>

                      {/* Next execution */}
                      <div className="flex items-center justify-between pt-3 border-t border-white/10">
                        <div className="flex items-center gap-2 text-sm text-gray-400">
                          <Clock size={14} />
                          <span>Next: {formatTime(order.nextExecution)}</span>
                        </div>
                        <div className="flex gap-2">
                          <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                            <Pause size={14} />
                          </button>
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
                      if (showTokenSelect === 'spend') {
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
