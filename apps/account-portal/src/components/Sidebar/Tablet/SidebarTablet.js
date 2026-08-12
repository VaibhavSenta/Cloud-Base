/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import { useRouter } from 'next/navigation';
import SidebarNavList from '../SidebarNavList/SidebarNavList';
import styles from './SidebarTablet.module.css';

const SidebarTablet = ({ user }) => {
  const router = useRouter();

  const mainNavLinks = [
    { title: 'Home', icon: '/icons/nav-home.svg', path: '/dashboard', onClick: () => router.push('/dashboard') },
    { title: 'Personal Info', icon: '/icons/nav-info.svg', path: '/dashboard/personal-info', onClick: () => router.push('/dashboard/personal-info') },
    { title: 'Signin & Security', icon: '/icons/nav-security.svg', path: '/dashboard/security', onClick: () => router.push('/dashboard/security') },
    { title: 'Active Sessions', icon: '/icons/device-mobile.svg', path: '/dashboard/security/sessions', onClick: () => router.push('/dashboard/security/sessions') },
  ];

  const bottomNavLinks = [
    { title: 'Connected Services', icon: '/icons/Connected_Services.svg', path: '/dashboard/connected-services', onClick: () => router.push('/dashboard/connected-services') },
    { title: 'Preferences', icon: '/icons/Preferences.svg', path: '/dashboard/preferences', onClick: () => router.push('/dashboard/preferences') },
  ];

  return (
    <div className={styles.sidebarContent}>
      {/* Top Navigation List */}
      <nav className={styles.nav}>
        <SidebarNavList items={mainNavLinks} />
      </nav>

      {/* Bottom Navigation List (Replaces Logout Button) */}
      <div className={styles.bottomSection}>
        <SidebarNavList items={bottomNavLinks} />
      </div>
    </div>
  );
};

export default SidebarTablet;
