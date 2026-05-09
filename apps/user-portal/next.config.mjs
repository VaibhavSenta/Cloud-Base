/** @type {import('next').NextConfig} */
const nextConfig = {
  // Existing rewrites jo tune pehle se set kiye hain
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: 'http://localhost:5000/api/v1/:path*',
      },
    ];
  },

  // Google Drive images ko allow karne ke liye ye add karo
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/d/**',
      },
    ],
  },
};

export default nextConfig;