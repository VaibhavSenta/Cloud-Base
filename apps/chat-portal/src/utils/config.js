/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
export const isDev = process.env.NODE_ENV !== 'production';

// Get base domain dynamically in browser, fallback to nothingbox.site
let domain = 'nothingbox.site';
let protocol = 'https:';
if (typeof window !== 'undefined') {
  protocol = window.location.protocol;
  const hostname = window.location.hostname;
  if (hostname && !['localhost', '127.0.0.1', '172.20.10.2'].includes(hostname)) {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      domain = parts.slice(-2).join('.');
    }
  }
}

export const config = {
  isDev,
  accountPortalUrl: process.env.NEXT_PUBLIC_ACCOUNT_PORTAL_URL || `${protocol}//account.${domain}`,
  accountApiUrl: process.env.NEXT_PUBLIC_ACCOUNT_API_URL || `${protocol}//account.${domain}/api/v1`,
  chatApiUrl: process.env.NEXT_PUBLIC_CHAT_API_URL || `${protocol}//chat.${domain}/api/v1`,
  socketUrl: process.env.NEXT_PUBLIC_SOCKET_URL || `${protocol}//chat.${domain}`,
};
