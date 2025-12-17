'use client';

import { Web3Provider } from '@/config/web3';

export default function ClientProviders({ children }) {
  return <Web3Provider>{children}</Web3Provider>;
}


