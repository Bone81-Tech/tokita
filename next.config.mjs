/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = {
  // Remove static export to allow API routes to work in Cloudflare Pages
  // Cloudflare Pages supports Next.js serverless functions properly

  images: {
    unoptimized: false, // Re-enable image optimization
  },

  // Additional configuration to reduce overall bundle size
  productionBrowserSourceMaps: false, // Don't generate source maps in production
  generateBuildId: async () => {
    // Generate a shorter build ID to reduce path lengths
    return 'build';
  },

  experimental: {
    serverActions: {
      allowedOrigins: ["tokita.pages.dev", "localhost:3000", "localhost:3001"]
    },
  },

  // Additional optimization settings
  webpack: (config, { isServer, nextRuntime }) => {
    // Reduce bundle size by externalizing heavy libraries
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // More aggressive optimization for production builds
    if (process.env.NODE_ENV === 'production') {
      // Ensure we're not building for edge runtime which might cause different issues
      if (nextRuntime !== 'edge') {
        config.optimization = {
          ...config.optimization,
          splitChunks: {
            chunks: 'all',
            maxInitialRequests: 25,
            maxAsyncRequests: 25,
            cacheGroups: {
              default: false,
              vendors: false,
              // Separate each major dependency into its own chunk with size limit
              react: {
                name: 'react',
                chunks: 'all',
                test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-is)[\\/]/,
                priority: 20,
                maxSize: 512 * 1024, // 512KB max
              },
              supabase: {
                name: 'supabase',
                chunks: 'all',
                test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
                priority: 18,
                maxSize: 512 * 1024, // 512KB max
              },
              // Bundle other vendors separately
              vendor: {
                name: 'vendor',
                chunks: 'all',
                test: /[\\/]node_modules[\\/]/,
                priority: 10,
                maxSize: 1024 * 1024, // 1MB max
              },
              // Common bundle for other shared code
              common: {
                name: 'common',
                minChunks: 2,
                chunks: 'all',
                priority: 5,
                maxSize: 512 * 1024, // 512KB max
              },
            },
          },
        };

        // Additional optimization: minimize bundle size
        // Remove unused code and optimize
        config.optimization.minimize = true;
      }
    }

    return config;
  },
};

const pwaConfig = {
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Disable PWA in development to prevent caching issues during development
  disable: process.env.NODE_ENV === 'development',
  // Configure runtime caching to exclude API routes
  runtimeCaching: [
    {
      urlPattern: /^\/api\/.*$/,
      handler: 'NetworkOnly', // Don't cache API routes
    },
    {
      urlPattern: /^\/_next\/data\/.*$/,
      handler: 'NetworkOnly', // Don't cache Next.js data requests
    },
    // Add other custom caching rules here
  ],
};

export default withPWA(pwaConfig)(nextConfig);
