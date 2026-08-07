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
  allowedDevOrigins: ['localhost', '*.localhost', 'nothingbox.site', '*.nothingbox.site', 'account.nothingbox.site', 'chat.nothingbox.site', 'admin.nothingbox.site', 'user.nothingbox.site'],

  async rewrites() {
    const userApiUrl = process.env.USER_API_URL || 'http://172.20.10.2:5005';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${userApiUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default withPWA(nextConfig);
