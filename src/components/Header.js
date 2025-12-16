'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { Menu, X, Wallet, ChevronDown, Zap, BarChart3, Clock, Shield } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { name: 'Swap', href: '#swap', icon: Zap },
  { name: 'DCA', href: '#dca', icon: Clock },
  { name: 'Limit', href: '#limit', icon: BarChart3 },
  { name: 'Stop-Loss', href: '#stoploss', icon: Shield },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { open } = useAppKit();
  const { address, isConnected } = useAppKitAccount();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const truncateAddress = (addr) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'glass py-3' : 'py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="relative w-10 h-10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-base-blue via-flow-cyan to-flow-purple rounded-xl opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0.5 bg-base-dark rounded-[10px] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M12 2L4 6V12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12V6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 10L12 14L16 10" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="gradient" x1="8" y1="10" x2="16" y2="14">
                        <stop stopColor="#0052FF"/>
                        <stop offset="1" stopColor="#00D4FF"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </motion.div>
              <span className="font-display font-bold text-xl gradient-text">
                BaseFlow
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                >
                  <item.icon size={16} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Wallet Connection */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => open()}
                className={`hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  isConnected
                    ? 'glass-card hover:border-base-blue/50'
                    : 'bg-gradient-to-r from-base-blue to-base-light hover:shadow-lg hover:shadow-base-blue/25'
                }`}
              >
                <Wallet size={18} />
                <span>{isConnected ? truncateAddress(address) : 'Connect'}</span>
                {isConnected && <ChevronDown size={14} className="text-gray-400" />}
              </motion.button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-x-0 top-[72px] z-40 md:hidden"
          >
            <div className="glass-card mx-4 rounded-2xl p-4 shadow-2xl">
              <nav className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-200"
                  >
                    <item.icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </nav>
              <div className="mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    open();
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    isConnected
                      ? 'glass-card'
                      : 'bg-gradient-to-r from-base-blue to-base-light'
                  }`}
                >
                  <Wallet size={18} />
                  <span>{isConnected ? truncateAddress(address) : 'Connect Wallet'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
