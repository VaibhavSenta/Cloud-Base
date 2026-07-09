import withPWA from 'next-pwa';

const withPWAConfig = withPWA({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  swSrc: 'worker/index.js',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack compatibility
  transpilePackages: ['next-pwa', 'secure-query-cache'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        // Admin API proxy
        source: '/api/admin/:path*',
        destination: `${process.env.BACKEND_URL || 'http://localhost:5001'}/api/v1/:path*`,
      },
      {
        // Upload API proxy
        source: '/api/upload/:path*',
        destination: 'http://localhost:5002/api/v1/:path*',
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
  },
  // Allow local dev IP as per project rules
  allowedDevOrigins: ['172.20.10.2'],
};

export default withPWAConfig(nextConfig);