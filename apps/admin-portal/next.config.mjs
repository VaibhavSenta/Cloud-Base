/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default nextConfig;