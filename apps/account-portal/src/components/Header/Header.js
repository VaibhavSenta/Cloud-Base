/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import { useState, useEffect } from 'react';
import useWindowSize from '../../hooks/useWindowSize';
import { useRouter, usePathname } from 'next/navigation';
import HeaderDesktop from './Desktop/HeaderDesktop';
import HeaderTablet from './Tablet/HeaderTablet';
import HeaderMobile from './Mobile/HeaderMobile';
import styles from './Header.module.css';

import { useSecureQuery } from '../../hooks/useSecureQuery';
import api from '../../utils/api';

/**
 * Universal Unified Header Wrapper
 * Admin Portal Style: Floating Pill Container
 */
const Header = ({ onToggleSidebar, isSidebarOpen, forceWidth }) => {
  const { width: windowWidth } = useWindowSize();
  const width = forceWidth || windowWidth;
  const router = useRouter();
  const pathname = usePathname();
  const [isOnline, setIsOnline] = useState(true);

  // Retrieve user data from cache
  const { data: user } = useSecureQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data;
    },
    enabled: typeof window !== 'undefined'
  });

  const isSubpage = pathname !== '/dashboard' && pathname !== '/';

  const segments = pathname.split('/').filter(Boolean);
  const isFirstLevelSubpage = segments.length === 2 && segments[0] === 'dashboard';

  const segmentMap = {
    'personal-info': 'Personal Information',
    'security': 'Signin & Security',
    'password': 'Password Options',
    'change': 'Change Password',
    'devices': 'Recent Activity',
    'sessions': 'Logged Devices',
    'connected-services': 'Connected Services',
    'preferences': 'Preferences',
    '2fa': 'Two-Factor Authentication',
  };

  const getHeaderTitle = (path) => {
    if (path === '/dashboard/personal-info') return 'Personal Information';
    if (path.includes('security')) return 'Signin & Security';
    if (path.includes('preferences')) return 'Preferences';
    if (path.includes('connected-services')) return 'Connected Services';
    return 'Nothing Box';
  };

  const getBreadcrumbs = (path) => {
    const segments = path.split('/').filter(s => s && s !== 'dashboard');
    if (segments.length <= 1) return null;

    const subSegments = segments.slice(1);
    const mapped = subSegments.map((seg, idx) => {
      // Check if it's the dynamic session ID parameter (if preceding segment is 'sessions')
      if (idx > 0 && subSegments[idx - 1] === 'sessions' && user?.sessions) {
        const foundSession = user.sessions.find(s => s.sessionId === seg);
        if (foundSession) return foundSession.deviceName || 'Device';
      }

      // Check if it's the dynamic log ID parameter (if preceding segment is 'devices')
      if (idx > 0 && subSegments[idx - 1] === 'devices' && user?.activityLogs) {
        const foundLog = user.activityLogs.find(l => l._id === seg || String(l.timestamp) === seg);
        if (foundLog) return foundLog.action;
      }

      // If it looks like a long hex / MongoDB ID / dynamic ID (more than 10 chars)
      if (seg.length > 10 && /^[a-fA-F0-9-]+$/.test(seg)) {
        return `...${seg.slice(-6)}`;
      }
      return segmentMap[seg] || seg.replace(/-/g, ' ');
    });
    
    if (mapped.length > 2) {
      return `... > ${mapped[mapped.length - 1]}`;
    }
    return mapped.join(' > ');
  };

  const handleBack = () => {
    router.back();
  };

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleLogoClick = () => {
    router.push('/dashboard');
  };

  const layoutProps = {
    isSubpage,
    handleBack,
    handleLogoClick,
    onToggleSidebar,
    isSidebarOpen,
    isOnline,
    getHeaderTitle,
    getBreadcrumbs,
    isFirstLevelSubpage,
    pathname
  };

  // SSR / Hydration Fallback: Render Mobile by default
  if (width === undefined) {
    return (
      <div className={styles.headerWrapper}>
        <HeaderMobile {...layoutProps} />
      </div>
    );
  }

  return (
    <div className={styles.headerWrapper}>
      {width >= 1024 ? (
        <HeaderDesktop {...layoutProps} />
      ) : width >= 768 ? (
        <HeaderTablet {...layoutProps} />
      ) : (
        <HeaderMobile {...layoutProps} />
      )}
    </div>
  );
};

export default Header;
