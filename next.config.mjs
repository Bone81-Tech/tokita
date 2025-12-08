/** @type {import('next').NextConfig} */
import withPWA from 'next-pwa';

const nextConfig = {
  // Remove static export to allow API routes to work in Cloudflare Pages
  // Cloudflare Pages supports Next.js serverless functions properly

  images: {
    unoptimized: false, // Re-enable image optimization
  },

  experimental: {
    serverActions: {
      allowedOrigins: ["tokita.pages.dev", "localhost:3000", "localhost:3001"]
    },
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
