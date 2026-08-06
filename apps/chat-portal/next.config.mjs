import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lucide-react', 'next-pwa'],
  allowedDevOrigins: ['172.20.10.2', 'localhost', '*.localhost', 'cloudbase.local', '*.cloudbase.local', 'chat.cloudbase.local', 'account.cloudbase.local', 'admin.cloudbase.local', 'user.cloudbase.local', 'nothingbox.site', '*.nothingbox.site', 'account.nothingbox.site', 'chat.nothingbox.site', 'admin.nothingbox.site', 'user.nothingbox.site'],
  async rewrites() {
    return [
      {
        source: '/api/v1/auth/:path*',
        destination: 'http://172.20.10.2:5010/api/v1/auth/:path*',
      },
      {
        source: '/api/v1/chat/:path*',
        destination: 'http://172.20.10.2:5006/api/v1/chat/:path*',
      },
      {
        source: '/uploads/:path*',
        destination: 'http://172.20.10.2:5010/uploads/:path*',
      },
    ];
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
};

export default withPWA(nextConfig);
