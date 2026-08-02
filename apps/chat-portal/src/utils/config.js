export const isDev = process.env.NODE_ENV !== 'production';

export const config = {
  isDev,
  accountPortalUrl: isDev ? 'http://account.cloudbase.local' : 'https://account.cloud-base.dev',
  accountApiUrl: isDev ? 'http://account.cloudbase.local/api/v1' : 'https://account.cloud-base.dev/api/v1',
  chatApiUrl: isDev ? 'http://chat.cloudbase.local/api/v1' : 'https://chat.cloud-base.dev/api/v1',
  socketUrl: isDev ? 'http://chat.cloudbase.local' : 'https://chat.cloud-base.dev',
};
