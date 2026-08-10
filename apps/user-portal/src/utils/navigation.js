/**
 * Returns the appropriate URL for a given app based on context.
 * Browser mode (Dev): localhost subdomains (e.g., account.localhost)
 * Browser mode (Prod): cloud-base.dev subdomains (e.g., account.cloud-base.dev)
 * PWA Standalone mode: subpath URLs (e.g., /account)
 */
export const getAppUrl = (appName, isStandalone) => {
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'nothingbox.site';

  // Automatically resolve the primary domain (e.g. nothingbox.site) based on current environment
  let domain = 'nothingbox.site';
  if (hostname && !['localhost', '127.0.0.1', '172.20.10.2'].includes(hostname)) {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      domain = parts.slice(-2).join('.');
    }
  }

  const subdomainMap = {
    chat: `${protocol}//chat.${domain}`,
    account: `${protocol}//account.${domain}`,
    admin: `${protocol}//admin.${domain}`,
  };

  const subpathMap = {
    chat: '/apps/chat',
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
