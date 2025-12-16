/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    // Ignore React Native modules that are not needed for web
    config.resolve.alias = {
      ...config.resolve.alias,
      '@react-native-async-storage/async-storage': false,
    };
    config.externals.push(
      'pino-pretty',
      'encoding',
      '@solana/kit',
      '@solana/web3.js',
      '@gemini-wallet/core',
      '@coinbase/cdp-sdk'
    );
    return config;
  },
};

module.exports = nextConfig;
