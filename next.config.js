/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configure cache handler only in production
  ...(process.env.NODE_ENV === 'production' && {
    cacheHandler: require.resolve('./cache-handler.js'),
  }),
  
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
    
    // Reduce memory usage in production builds
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            default: false,
            vendors: false,
            // Create smaller chunks
            vendor: {
              name: 'vendor',
              chunks: 'all',
              test: /node_modules/,
              priority: 20,
            },
            common: {
              name: 'common',
              minChunks: 2,
              chunks: 'all',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
          },
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
  
  // Disable source maps in production to save memory
  productionBrowserSourceMaps: false,
  
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