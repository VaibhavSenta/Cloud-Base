const isDev = process.env.NODE_ENV !== 'production';

const getCookieConfig = (req, maxAge) => {
  const host = req ? (req.hostname || req.headers?.host || '').split(':')[0] : '';
  const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(host);
  const isLocalhost = host === 'localhost' || host === '127.0.0.1';
  
  const options = {
    httpOnly: true,
    secure: !isDev,
    sameSite: 'lax',
    path: '/',
    maxAge: maxAge
  };

  // Only set domain attribute if accessing via a real domain name
  if (!isIp && !isLocalhost && !isDev) {
    options.domain = process.env.COOKIE_DOMAIN || '.cloud-base.dev';
  } else if (!isIp && !isLocalhost && isDev) {
    options.domain = '.cloudbase.local';
  }

  return options;
};

module.exports = {
  isDev,
  isProd: !isDev,
  port: process.env.PORT || 5010,
  jwtSecret: process.env.JWT_SECRET || (isDev ? 'CB_SUPER_SECRET_KEY_FOR_LOCAL_DEV' : null),
  getCookieConfig,
  cookieConfig: {
    httpOnly: true,
    secure: !isDev,
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60 * 1000 // 15 mins default access token
  },
  accessCookieConfig: {
    httpOnly: true,
    secure: !isDev,
    sameSite: 'lax',
    path: '/',
    maxAge: 15 * 60 * 1000 // 15 mins
  },
  refreshCookieConfig: {
    httpOnly: true,
    secure: !isDev,
    sameSite: 'lax',
    path: '/',
    maxAge: 5 * 24 * 60 * 60 * 1000 // 5 days
  },
  allowedOrigins: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : (isDev 
        ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003', 'http://localhost', 'http://cloudbase.local', 'http://chat.cloudbase.local', 'http://account.cloudbase.local', 'http://admin.cloudbase.local', 'http://user.cloudbase.local', 'http://chat.localhost', 'http://account.localhost', 'http://admin.localhost', 'http://172.20.10.2:3000', 'http://172.20.10.2:3001', 'http://172.20.10.2:3003', 'http://172.20.10.2:5010', 'http://172.20.10.2:5006']
        : ['https://cloud-base.dev', 'https://account.cloud-base.dev', 'https://chat.cloud-base.dev', 'https://admin.cloud-base.dev']
      )
};
