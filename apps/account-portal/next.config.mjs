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
  allowedDevOrigins: ['localhost', '*.localhost', 'nothingbox.site', '*.nothingbox.site', 'account.nothingbox.site', 'chat.nothingbox.site', 'admin.nothingbox.site', 'user.nothingbox.site'],

  images: {
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
  },

  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5010';
    return [
      {
        source: '/api/v1/:path*',
        destination: `${backendUrl}/api/v1/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${backendUrl}/uploads/:path*`,
      },
    ];
  },
};

export default withPWA(nextConfig);
