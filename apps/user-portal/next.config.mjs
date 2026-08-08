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
  allowedDevOrigins: [
    'localhost', '*.localhost',
    'nothingbox.site', '*.nothingbox.site',
    'nothingbox.test', '*.nothingbox.test',
    'account.nothingbox.test', 'chat.nothingbox.test', 'admin.nothingbox.test', 'user.nothingbox.test',
    'account.nothingbox.site', 'chat.nothingbox.site', 'admin.nothingbox.site', 'user.nothingbox.site'
  ],

  async rewrites() {
    let userApiUrl = process.env.USER_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5010';
    userApiUrl = userApiUrl.replace(/\/api\/v1\/?$/, '');
    return [
      {
        source: '/api/v1/:path*',
        destination: `${userApiUrl}/api/v1/:path*`,
      },
    ];
  },
};

export default withPWA(nextConfig);
