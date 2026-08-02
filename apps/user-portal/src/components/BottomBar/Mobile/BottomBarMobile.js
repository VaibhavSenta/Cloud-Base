'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useStandaloneMode } from '@/hooks/useStandaloneMode';
import { getAppUrl, isExternalNavigation } from '@/utils/navigation';
import styles from './BottomBarMobile.module.css';

export default function BottomBarMobile() {
  const pathname = usePathname();
  const router = useRouter();
  const isStandalone = useStandaloneMode();

  const handleNavigation = (appName) => {
    if (appName === 'home') {
      router.push('/');
      return;
    }

    const targetUrl = getAppUrl(appName, isStandalone);

    if (isExternalNavigation(targetUrl)) {
      window.location.href = targetUrl;
    } else {
      router.push(targetUrl);
    }
  };

  const isActive = (tab) => {
    if (tab === 'home' && pathname === '/') return true;
    return pathname.startsWith(`/${tab}`);
  };

  return (
    <nav className={styles.bottomBar}>
      <button 
        className={`${styles.tabItem} ${isActive('home') ? styles.active : ''}`}
        onClick={() => handleNavigation('home')}
      >
        <span className={styles.tabLabel}>Home</span>
      </button>
      <button 
        className={`${styles.tabItem} ${isActive('chat') ? styles.active : ''}`}
        onClick={() => handleNavigation('chat')}
      >
        <span className={styles.tabLabel}>Chat</span>
      </button>
      <button 
        className={`${styles.tabItem} ${isActive('vault') ? styles.active : ''}`}
        onClick={() => handleNavigation('vault')}
      >
        <span className={styles.tabLabel}>Playground</span>
      </button>
      <button 
        className={`${styles.tabItem} ${isActive('account') ? styles.active : ''}`}
        onClick={() => handleNavigation('account')}
      >
        <span className={styles.tabLabel}>Account</span>
      </button>
    </nav>
  );
}
