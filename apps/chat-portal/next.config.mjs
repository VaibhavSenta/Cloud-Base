/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import withPWAInit from 'next-pwa';

const withPWA = withPWAInit({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
  importScripts: ['/push-sw.js'],
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['lucide-react', 'next-pwa'],
  allowedDevOrigins: [
    'localhost', '*.localhost',
    'nothingbox.site', '*.nothingbox.site',
    'nothingbox.test', '*.nothingbox.test',
    'account.nothingbox.test', 'chat.nothingbox.test', 'admin.nothingbox.test',
    'account.nothingbox.site', 'chat.nothingbox.site', 'admin.nothingbox.site'
  ],
  async rewrites() {
    let accountApiUrl = process.env.ACCOUNT_API_URL || process.env.NEXT_PUBLIC_ACCOUNT_API_URL || 'http://localhost:5010';
    let chatApiUrl = process.env.CHAT_API_URL || process.env.NEXT_PUBLIC_CHAT_API_URL || 'http://localhost:5006';

    // Strip trailing /api/v1 if present in environment variables to prevent duplicate paths
    accountApiUrl = accountApiUrl.replace(/\/api\/v1\/?$/, '');
    chatApiUrl = chatApiUrl.replace(/\/api\/v1\/?$/, '');

    return [
      {
        source: '/api/v1/auth/:path*',
        destination: `${accountApiUrl}/api/v1/auth/:path*`,
      },
      {
        source: '/api/v1/chat/:path*',
        destination: `${chatApiUrl}/api/v1/chat/:path*`,
      },
      {
        source: '/uploads/:path*',
        destination: `${accountApiUrl}/uploads/:path*`,
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
