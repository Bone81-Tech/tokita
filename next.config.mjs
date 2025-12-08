/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = {
  // Static export for Cloudflare Pages
  output: 'export',

  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },

  // Trailing slash for better Cloudflare Pages compatibility
  trailingSlash: true,
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
