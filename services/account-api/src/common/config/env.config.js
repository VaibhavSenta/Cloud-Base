/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
const isDev = process.env.NODE_ENV !== 'production';

module.exports = {
  isDev,
  isProd: !isDev,
  port: process.env.PORT || 5010,
  jwtSecret: process.env.JWT_SECRET || (isDev ? 'CB_SUPER_SECRET_KEY_FOR_LOCAL_DEV' : null),
  cookieConfig: {
    httpOnly: true,
    secure: !isDev,
    sameSite: 'lax',
    path: '/',
    domain: process.env.COOKIE_DOMAIN || (isDev ? undefined : '.nothingbox.site'),
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  },
  allowedOrigins: process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(',') 
    : (isDev 
        ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3003', 'http://localhost', 'http://nothingbox.site', 'http://account.nothingbox.site', 'http://chat.nothingbox.site', 'http://admin.nothingbox.site']
        : ['https://nothingbox.site', 'https://account.nothingbox.site', 'https://chat.nothingbox.site', 'https://admin.nothingbox.site']
      )
};
