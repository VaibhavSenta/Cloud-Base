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
  allowedDevOrigins: ['172.20.10.2', 'localhost', '*.localhost', 'cloudbase.local', '*.cloudbase.local', 'chat.cloudbase.local', 'account.cloudbase.local', 'admin.cloudbase.local', 'user.cloudbase.local'],
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
    ];
  },
  webpack(config) {
    // Add custom configuration adjustments if needed
    return config;
  },
};

export default withPWA(nextConfig);
