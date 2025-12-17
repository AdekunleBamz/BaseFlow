'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import SwapInterface from '@/components/SwapInterface';
import DCAInterface from '@/components/DCAInterface';
import LimitStopLossInterface from '@/components/LimitStopLossInterface';
import Footer from '@/components/Footer';
import { Zap, Clock, Layers, ArrowRight } from 'lucide-react';

const tradingModes = [
  { id: 'swap', label: 'Swap', icon: Zap, color: 'from-base-blue to-flow-cyan' },
  { id: 'dca', label: 'DCA', icon: Clock, color: 'from-flow-cyan to-flow-purple' },
  { id: 'advanced', label: 'Advanced', icon: Layers, color: 'from-flow-purple to-flow-pink' },
];

export default function HomeClient({ initialMode = 'swap' }) {
  const [activeMode, setActiveMode] = useState(initialMode);

  useEffect(() => {
    const handler = (e) => {
      const mode = e?.detail?.mode;
      if (mode) setActiveMode(mode);
      const targetId = e?.detail?.scrollToId;
      if (targetId) {
        const el = document.getElementById(targetId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    window.addEventListener('baseflow:navigate', handler);
    return () => window.removeEventListener('baseflow:navigate', handler);
  }, []);

  return (
    <main className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <Hero onNavigate={(mode, scrollToId) => {
        setActiveMode(mode || 'swap');
        if (scrollToId) {
          const el = document.getElementById(scrollToId);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }} />

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


