'use client';

import { motion } from 'framer-motion';
import { useAppKit } from '@reown/appkit/react';
import { ArrowRight, Zap, Shield, Clock, TrendingUp, Sparkles } from 'lucide-react';

const features = [
  {
    icon: Zap,
    title: 'Lightning Swaps',
    description: 'Best rates across all Base DEXs',
    color: 'from-flow-cyan to-base-blue',
  },
  {
    icon: Clock,
    title: 'Auto DCA',
    description: 'Set it and forget it strategies',
    color: 'from-flow-purple to-flow-pink',
  },
  {
    icon: TrendingUp,
    title: 'Limit Orders',
    description: 'Buy the dip automatically',
    color: 'from-flow-green to-flow-cyan',
  },
  {
    icon: Shield,
    title: 'Stop-Loss',
    description: 'Protect your positions 24/7',
    color: 'from-red-500 to-orange-500',
  },
];

const stats = [
  { value: '$0', label: 'Total Volume', suffix: '' },
  { value: '0', label: 'Trades Executed', suffix: '+' },
  { value: '0.3', label: 'Swap Fee', suffix: '%' },
  { value: '4', label: 'DEXs Integrated', suffix: '' },
];

export default function Hero() {
  const { open } = useAppKit();

  return (
    <section className="relative min-h-screen flex flex-col justify-center pt-24 pb-12 overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gradient orbs */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-1/4 -left-32 w-96 h-96 bg-base-blue/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/3 -right-32 w-96 h-96 bg-flow-purple/25 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.3, 0.15],
          }}
          transition={{ duration: 12, repeat: Infinity }}
          className="absolute bottom-0 left-1/3 w-96 h-96 bg-flow-cyan/20 rounded-full blur-[120px]"
        />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-base-blue/50 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card">
            <Sparkles className="w-4 h-4 text-flow-cyan" />
            <span className="text-sm font-medium">Now Live on Base Mainnet</span>
            <div className="w-2 h-2 rounded-full bg-flow-green animate-pulse" />
          </div>
        </motion.div>

        {/* Main heading */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-center mb-6"
        >
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4">
            <span className="block">Trade Smarter</span>
            <span className="block gradient-text">Flow Faster</span>
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto mb-10"
        >
          The ultimate DEX aggregator on Base. Best rates, automated strategies, 
          and advanced order types — all in one beautiful interface.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => open()}
            className="group relative px-8 py-4 rounded-2xl font-display font-semibold text-lg overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-base-blue via-flow-cyan to-flow-purple bg-[length:200%_100%] animate-gradient" />
            <div className="absolute inset-0.5 bg-base-dark rounded-[14px]" />
            <span className="relative flex items-center gap-2 bg-gradient-to-r from-base-blue via-flow-cyan to-flow-purple bg-clip-text text-transparent">
              Launch App
              <ArrowRight className="w-5 h-5 text-flow-cyan group-hover:translate-x-1 transition-transform" />
            </span>
          </motion.button>

          <motion.a
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            href="#features"
            className="px-8 py-4 rounded-2xl font-display font-semibold text-lg glass-card hover:border-white/20 transition-all"
          >
            Learn More
          </motion.a>
        </motion.div>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 + index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="glass-card rounded-2xl p-5 group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 mb-4`}>
                <div className="w-full h-full rounded-[10px] bg-base-dark flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <h3 className="font-display font-semibold mb-1 group-hover:text-flow-cyan transition-colors">
                {feature.title}
              </h3>
              <p className="text-sm text-gray-500">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.9 + index * 0.1 }}
              className="text-center"
            >
              <div className="font-display text-3xl sm:text-4xl font-bold gradient-text mb-1">
                {stat.value}{stat.suffix}
              </div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
        >
          <motion.div
            animate={{ opacity: [0.5, 1, 0.5], y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-2 bg-white/50 rounded-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
