/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure cache handler at top level
  cacheHandler: require.resolve('./cache-handler.js'),
  
  // Configure webpack for better caching
  webpack: (config, { dev, isServer }) => {
    // Enable persistent caching in development
    if (dev) {
      config.cache = {
        type: 'filesystem',
        buildDependencies: {
          config: [__filename],
        },
      };
    }
    
    return config;
  },
  
  // Disable SWC minification to reduce memory usage
  swcMinify: false,
  
  // Disable image optimization to reduce memory usage
  images: {
    unoptimized: true,
  },
  
  // Enable compression
  compress: true,
  
  // Configure headers for caching
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig; 