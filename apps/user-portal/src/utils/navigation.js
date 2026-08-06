/**
 * Returns the appropriate URL for a given app based on context.
 * Browser mode (Dev): localhost subdomains (e.g., account.localhost)
 * Browser mode (Prod): cloud-base.dev subdomains (e.g., account.cloud-base.dev)
 * PWA Standalone mode: subpath URLs (e.g., /account)
 */
export const getAppUrl = (appName, isStandalone) => {
  const isNothingbox = typeof window !== 'undefined' && window.location.hostname.endsWith('nothingbox.site');
  const isDev = typeof window !== 'undefined' && 
    (window.location.hostname.endsWith('localhost') || 
     window.location.hostname.endsWith('cloudbase.local') ||
     window.location.hostname === '127.0.0.1' || 
     window.location.hostname === '172.20.10.2');

  let subdomainMap;
  if (isNothingbox) {
    subdomainMap = {
      chat: 'http://chat.nothingbox.site',
      vault: 'http://chat.nothingbox.site', // Falls back to chat since vault is not running yet
      account: 'http://account.nothingbox.site',
      admin: 'http://admin.nothingbox.site',
    };
  } else if (isDev) {
    subdomainMap = {
      chat: 'http://chat.cloudbase.local',
      vault: 'http://chat.cloudbase.local',
      account: 'http://account.cloudbase.local',
      admin: 'http://admin.cloudbase.local',
    };
  } else {
    subdomainMap = {
      chat: 'https://chat.cloud-base.dev',
      vault: 'https://chat.cloud-base.dev',
      account: 'https://account.cloud-base.dev',
      admin: 'https://admin.cloud-base.dev',
    };
  }

  const subpathMap = {
    chat: '/apps/chat',
    vault: '/apps/chat',
    account: '/account',
    admin: '/admin',
  };

  if (isStandalone) {
    return subpathMap[appName] || '/';
  }
  return subdomainMap[appName] || '/';
};

/**
 * Checks if a URL is an external subdomain navigation
 */
export const isExternalNavigation = (url) => {
  return url.startsWith('https://') || url.startsWith('http://');
};
