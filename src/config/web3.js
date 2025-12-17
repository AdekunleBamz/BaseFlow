'use client';

import { createAppKit } from '@reown/appkit/react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { injected, walletConnect } from 'wagmi/connectors';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo';

const metadata = {
  name: 'BaseFlow',
  description: 'DEX Aggregator on Base',
  // Avoid referencing window during module evaluation on the server
  url: 'https://baseflow.app',
  icons: ['/images/icon.png'],
};

// IMPORTANT: Next may evaluate this module during SSR/bundling.
const isBrowser = typeof window !== 'undefined';
const runtimeMetadata = isBrowser ? { ...metadata, url: window.location.origin } : metadata;

// IMPORTANT:
// - `useAppKit()` / `useAppKitAccount()` requires `createAppKit()` to be called first.
// - We must NOT touch browser-only APIs (like localStorage) during SSR/build.
// So we initialize AppKit at module-load, but only in the browser.
if (isBrowser) {
  // Avoid double-initialization during Fast Refresh
  if (!globalThis.__BASEFLOW_APPKIT_INITIALIZED__) {
    globalThis.__BASEFLOW_APPKIT_INITIALIZED__ = true;
  createAppKit({
    adapters: [new WagmiAdapter({ projectId, networks: [base] })],
    networks: [base],
    projectId,
    metadata: runtimeMetadata,
    features: {
      analytics: false,
    },
    themeMode: 'dark',
  });
  }
}

const wagmiConfig = createConfig({
  chains: [base],
  transports: {
    [base.id]: http('https://mainnet.base.org'),
  },
  connectors: isBrowser
    ? [injected(), walletConnect({ projectId, metadata: runtimeMetadata, showQrModal: false })]
    : [],
  // Prevent WalletConnect/Wagmi from trying to use localStorage during SSR/build
  ssr: false,
});

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
    },
  },
});

export function Web3Provider({ children }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
