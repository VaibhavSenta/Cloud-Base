import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Turbopack compatibility if needed
  transpilePackages: ['lucide-react', 'next-pwa'],
  allowedDevOrigins: process.env.NODE_ENV === 'development' ? ['172.20.10.2'] : [],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.gravatar.com',
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `http://172.20.10.2:5010/api/v1/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `http://172.20.10.2:5010/uploads/:path*`,
      },
    ];
  },
};

export default withPWA(nextConfig);
