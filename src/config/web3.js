'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';

// Base mainnet chain configuration
const baseChain = {
  ...base,
  rpcUrls: {
    default: { http: ['https://mainnet.base.org'] },
    public: { http: ['https://mainnet.base.org'] },
  },
};

// Project ID from WalletConnect Cloud (replace with your own)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID';

// Metadata for your app
const metadata = {
  name: 'BaseFlow',
  description: 'Trade Smarter, Flow Faster - DEX Aggregator & Trading Automation on Base',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://baseflow.app',
  icons: ['/images/icon.png'],
};

// Create wagmi adapter
const wagmiAdapter = new WagmiAdapter({
  networks: [baseChain],
  projectId,
  ssr: true,
});

// Create the AppKit instance
createAppKit({
  adapters: [wagmiAdapter],
  networks: [baseChain],
  projectId,
  metadata,
  features: {
    analytics: true,
    email: true,
    socials: ['google', 'x', 'github', 'discord', 'farcaster'],
    emailShowWallets: true,
  },
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#0052FF',
    '--w3m-color-mix-strength': 40,
    '--w3m-accent': '#0052FF',
    '--w3m-border-radius-master': '12px',
  },
});

// Query client for React Query
const queryClient = new QueryClient();

export function Web3Provider({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export { wagmiAdapter };
