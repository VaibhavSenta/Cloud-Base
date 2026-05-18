/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        // 1. Admin API ke liye short proxy
        source: '/api/admin/:path*',
        destination: 'http://localhost:5001/api/v1/:path*', // Seedha api/v1 par bhejega
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