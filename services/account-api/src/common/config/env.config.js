const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  isDev,
  isProd: !isDev,
  port: process.env.PORT || 5010,
  jwtSecret: process.env.JWT_SECRET || (isDev ? 'CB_SUPER_SECRET_KEY_FOR_LOCAL_DEV' : null),
  cookieConfig: {
    httpOnly: true,
    secure: !isDev, // HTTP in dev, HTTPS in prod
    sameSite: 'lax',
    path: '/',
    domain: isDev ? '.cloudbase.local' : (process.env.COOKIE_DOMAIN || '.cloud-base.dev'),
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  allowedOrigins: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : (isDev 
        ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003', 'http://localhost', 'http://cloudbase.local', 'http://chat.cloudbase.local', 'http://account.cloudbase.local', 'http://admin.cloudbase.local', 'http://user.cloudbase.local', 'http://chat.localhost', 'http://account.localhost', 'http://admin.localhost', 'http://172.20.10.2:3000', 'http://172.20.10.2:3001', 'http://172.20.10.2:3003', 'http://172.20.10.2:5010', 'http://172.20.10.2:5006']
        : ['https://cloud-base.dev', 'https://account.cloud-base.dev', 'https://chat.cloud-base.dev', 'https://admin.cloud-base.dev']
      )
};
