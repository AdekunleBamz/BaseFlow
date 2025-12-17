/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer, dev }) => {
    // In dev, Next defaults to "eval-source-map" which makes huge chunks that are slow to evaluate
    // and can trigger ChunkLoadError timeouts in the browser.
    if (dev) {
      config.devtool = false;
    }
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
    // Handle porto internal module resolution
    config.resolve.alias['porto/internal'] = require.resolve('porto/internal');
    // IMPORTANT:
    // Do NOT push arbitrary string externals into the client bundle.
    // It can generate invalid JS like `module.exports = @gemini-wallet/core;`
    // which breaks chunk loading in the browser.
    return config;
  },
};

module.exports = nextConfig;
