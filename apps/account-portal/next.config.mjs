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

  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        // Use the IP directly for mobile testing to ensure proxy works on network
        destination: `http://172.20.10.2:5010/api/v1/:path*`,
      },
    ];
  },
};

export default withPWA(nextConfig);
