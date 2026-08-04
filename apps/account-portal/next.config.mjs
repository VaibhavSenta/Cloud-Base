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
  allowedDevOrigins: ['172.20.10.2', 'localhost', '*.localhost', 'cloudbase.local', '*.cloudbase.local', 'chat.cloudbase.local', 'account.cloudbase.local', 'admin.cloudbase.local', 'user.cloudbase.local'],

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

  webpack(config, { dev }) {
    if (dev) {
      config.watchOptions = {
        poll: 800,
        aggregateTimeout: 300,
      };
    }
    return config;
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
