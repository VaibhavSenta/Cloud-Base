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
  transpilePackages: ['lucide-react', 'next-pwa', 'secure-query-cache'],
  allowedDevOrigins: process.env.NODE_ENV === 'development' ? ['172.20.10.2'] : [],

  images: {
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
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
    ];
  },
};

export default withPWA(nextConfig);
