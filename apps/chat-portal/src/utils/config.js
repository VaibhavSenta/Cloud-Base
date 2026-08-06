export const isDev = process.env.NODE_ENV !== 'production';

export const config = {
  isDev,
  accountPortalUrl: process.env.NEXT_PUBLIC_ACCOUNT_PORTAL_URL || (isDev ? 'http://localhost:3001' : 'https://account.cloud-base.dev'),
  accountApiUrl: process.env.NEXT_PUBLIC_ACCOUNT_API_URL || (isDev ? 'http://localhost:5010/api/v1' : 'https://account.cloud-base.dev/api/v1'),
  chatApiUrl: process.env.NEXT_PUBLIC_CHAT_API_URL || (isDev ? 'http://localhost:5006/api/v1' : 'https://chat.cloud-base.dev/api/v1'),
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || (isDev ? 'http://localhost:5006' : 'https://chat.cloud-base.dev'),
};
