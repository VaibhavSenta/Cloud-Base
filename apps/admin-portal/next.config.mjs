import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack compatibility
  transpilePackages: ['next-pwa'],
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        // 1. Admin API ke liye short proxy
        source: '/api/admin/:path*',
        destination: `${process.env.BACKEND_URL}/api/v1/:path*`, // Seedha api/v1 par bhejega
      },
      {
        // 2. Upload API ke liye short proxy
        source: '/api/upload/:path*',
        destination: 'http://localhost:5002/api/v1/:path*', // Seedha upload ke api/v1 par bhejega
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default withPWA(nextConfig);