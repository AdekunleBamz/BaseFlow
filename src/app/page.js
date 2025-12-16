'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import SwapInterface from '@/components/SwapInterface';
import DCAInterface from '@/components/DCAInterface';
import LimitStopLossInterface from '@/components/LimitStopLossInterface';
import Footer from '@/components/Footer';
import { Zap, Clock, BarChart3, Shield, Layers, ArrowRight } from 'lucide-react';

const tradingModes = [
  { id: 'swap', label: 'Swap', icon: Zap, color: 'from-base-blue to-flow-cyan' },
  { id: 'dca', label: 'DCA', icon: Clock, color: 'from-flow-cyan to-flow-purple' },
  { id: 'advanced', label: 'Advanced', icon: Layers, color: 'from-flow-purple to-flow-pink' },
];

export default function Home() {
  const [activeMode, setActiveMode] = useState('swap');

  return (
    <main className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <Hero />

      {/* Trading Section */}
      <section id="features" className="relative py-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-base-blue/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-flow-purple/10 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Start <span className="gradient-text">Trading</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Choose your trading style. From simple swaps to advanced automated strategies.
            </p>
          </motion.div>

          {/* Mode Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="flex justify-center mb-12"
          >
            <div className="inline-flex p-1.5 rounded-2xl glass-card">
              {tradingModes.map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setActiveMode(mode.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    activeMode === mode.id
                      ? `bg-gradient-to-r ${mode.color} text-white shadow-lg`
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <mode.icon size={18} />
                  {mode.label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Trading Interface */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {activeMode === 'swap' && <SwapInterface />}
            {activeMode === 'dca' && <DCAInterface />}
            {activeMode === 'advanced' && <LimitStopLossInterface />}
          </motion.div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              Three simple steps to supercharge your trading on Base.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Connect Wallet',
                description: 'Link your wallet with a single click. We support all major wallets and social logins.',
                icon: '🔗',
              },
              {
                step: '02',
                title: 'Choose Strategy',
                description: 'Pick from instant swaps, DCA orders, limit orders, or stop-losses based on your needs.',
                icon: '📊',
              },
              {
                step: '03',
                title: 'Execute & Automate',
                description: 'Confirm your transaction and let BaseFlow handle the rest. Sit back and watch your strategy execute.',
                icon: '🚀',
              },
            ].map((item, index) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {/* Connector line */}
                {index < 2 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-px bg-gradient-to-r from-base-blue/50 to-transparent" />
                )}
                
                <div className="glass-card rounded-3xl p-8 h-full relative overflow-hidden group hover:border-base-blue/30 transition-all duration-300">
                  {/* Step number */}
                  <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-base-blue/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-base-blue font-mono font-bold">{item.step}</span>
                    <h3 className="font-display font-semibold text-xl">{item.title}</h3>
                  </div>
                  <p className="text-gray-500">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported DEXs Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-flow-cyan/5 rounded-full blur-[150px]" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
              Powered by <span className="gradient-text">Best DEXs</span>
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              We aggregate liquidity from the top decentralized exchanges on Base to get you the best rates.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: 'Uniswap V3', icon: '🦄', volume: '$2.1B+' },
              { name: 'Aerodrome', icon: '✈️', volume: '$1.5B+' },
              { name: 'BaseSwap', icon: '🔄', volume: '$500M+' },
              { name: 'SushiSwap', icon: '🍣', volume: '$300M+' },
            ].map((dex, index) => (
              <motion.div
                key={dex.name}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="glass-card rounded-2xl p-6 text-center group cursor-pointer"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {dex.icon}
                </div>
                <h3 className="font-display font-semibold mb-1">{dex.name}</h3>
                <p className="text-sm text-gray-500">Volume: {dex.volume}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative glass-card rounded-3xl p-12 text-center overflow-hidden"
          >
            {/* Background gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-base-blue/20 via-transparent to-flow-purple/20" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-base-blue/50 to-transparent" />
            
            <div className="relative">
              <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                Ready to <span className="gradient-text">Flow</span>?
              </h2>
              <p className="text-gray-400 max-w-xl mx-auto mb-8">
                Join traders who trust BaseFlow for smarter trading on Base. 
                Start with a single swap or set up your automated strategies today.
              </p>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-display font-semibold text-lg bg-gradient-to-r from-base-blue to-flow-cyan hover:shadow-lg hover:shadow-base-blue/30 transition-all"
              >
                Start Trading
                <ArrowRight className="w-5 h-5" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
