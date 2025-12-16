'use client';

import { motion } from 'framer-motion';
import { Github, Twitter, MessageCircle, ExternalLink } from 'lucide-react';

const footerLinks = {
  Protocol: [
    { name: 'Swap', href: '#swap' },
    { name: 'DCA', href: '#dca' },
    { name: 'Limit Orders', href: '#limit' },
    { name: 'Stop-Loss', href: '#stoploss' },
  ],
  Resources: [
    { name: 'Documentation', href: '#', external: true },
    { name: 'Smart Contract', href: '#', external: true },
    { name: 'Audit Report', href: '#', external: true },
    { name: 'Brand Kit', href: '#', external: true },
  ],
  Community: [
    { name: 'Twitter', href: 'https://twitter.com', external: true },
    { name: 'Farcaster', href: 'https://warpcast.com', external: true },
    { name: 'Discord', href: '#', external: true },
    { name: 'GitHub', href: 'https://github.com', external: true },
  ],
};

const socialLinks = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: MessageCircle, href: 'https://warpcast.com', label: 'Farcaster' },
  { icon: Github, href: 'https://github.com', label: 'GitHub' },
];

export default function Footer() {
  return (
    <footer className="relative mt-20 border-t border-white/10">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-base-blue/5 to-transparent pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 bg-gradient-to-br from-base-blue via-flow-cyan to-flow-purple rounded-xl opacity-80" />
                <div className="absolute inset-0.5 bg-base-dark rounded-[10px] flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                    <path d="M12 2L4 6V12C4 16.4183 7.58172 20 12 20C16.4183 20 20 16.4183 20 12V6L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M8 10L12 14L16 10" stroke="url(#footerGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="footerGradient" x1="8" y1="10" x2="16" y2="14">
                        <stop stopColor="#0052FF"/>
                        <stop offset="1" stopColor="#00D4FF"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <span className="font-display font-bold text-xl gradient-text">
                BaseFlow
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-6 max-w-xs">
              The ultimate DEX aggregator on Base. Trade smarter with automated strategies and the best rates across all DEXs.
            </p>
            
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl glass-card flex items-center justify-center text-gray-400 hover:text-white hover:border-base-blue/50 transition-all"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-display font-semibold mb-4 text-white">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="text-gray-500 hover:text-white text-sm flex items-center gap-1 transition-colors group"
                    >
                      {link.name}
                      {link.external && (
                        <ExternalLink size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm">
            © 2024 BaseFlow. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 text-sm">Built on</span>
            <a
              href="https://base.org"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card hover:border-base-blue/50 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 111 111" fill="none">
                <path d="M54.921 110.034C85.359 110.034 110.034 85.402 110.034 55.017C110.034 24.6319 85.359 0 54.921 0C26.0432 0 2.35281 22.1714 0 50.3923H72.8467V59.6416H0C2.35281 87.8625 26.0432 110.034 54.921 110.034Z" fill="#0052FF"/>
              </svg>
              <span className="text-sm font-medium">Base</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
