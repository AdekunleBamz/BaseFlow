import './globals.css';
import ClientProviders from './ClientProviders';

export const metadata = {
  title: 'BaseFlow | Trade Smarter, Flow Faster',
  description: 'DEX Aggregator & Trading Automation Protocol on Base. Swap tokens, set up DCA, limit orders, and stop-losses all in one place.',
  keywords: 'DEX, aggregator, Base, DeFi, swap, DCA, limit orders, stop-loss, trading, automation',
  authors: [{ name: 'BaseFlow' }],
  creator: 'BaseFlow',
  publisher: 'BaseFlow',
  
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://baseflow.app',
    siteName: 'BaseFlow',
    title: 'BaseFlow | Trade Smarter, Flow Faster',
    description: 'DEX Aggregator & Trading Automation Protocol on Base. Swap tokens, set up DCA, limit orders, and stop-losses.',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'BaseFlow - DEX Aggregator on Base',
      },
    ],
  },
  
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'BaseFlow | Trade Smarter, Flow Faster',
    description: 'DEX Aggregator & Trading Automation Protocol on Base',
    images: ['/images/og-image.png'],
    creator: '@baseflow',
  },
  
  // Farcaster Frame
  other: {
    'fc:frame': 'vNext',
    'fc:frame:image': '/images/og-image.png',
    'fc:frame:image:aspect_ratio': '1.91:1',
    'fc:frame:button:1': 'Launch App',
    'fc:frame:button:1:action': 'link',
    'fc:frame:button:1:target': 'https://baseflow.app',
  },
  
  // Icons
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/images/icon.png',
  },
  
  // Manifest
  manifest: '/manifest.json',
  
  // Viewport
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
  
  // Theme
  themeColor: '#0052FF',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Farcaster Mini App Meta Tags */}
        <meta name="fc:frame" content="vNext" />
        <meta name="fc:frame:image" content="/images/og-image.png" />
        <meta name="fc:frame:image:aspect_ratio" content="1.91:1" />
        <meta name="fc:frame:button:1" content="Launch App" />
        <meta name="fc:frame:button:1:action" content="link" />
        <meta name="fc:frame:button:1:target" content="https://baseflow.app" />
        
        {/* Additional meta for mini app */}
        <meta name="farcaster:manifest" content="/farcaster-manifest.json" />
      </head>
      <body className="antialiased">
        <ClientProviders>
          {children}
        </ClientProviders>
      </body>
    </html>
  );
}
