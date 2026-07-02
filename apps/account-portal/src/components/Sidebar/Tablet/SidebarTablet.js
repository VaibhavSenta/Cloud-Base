'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './SidebarTablet.module.css';
import List from '../../UI/List/List';
import api from '../../../utils/api';
import { useSecureQueryClient } from '../../../hooks/useSecureQuery';

const SidebarTablet = ({ user }) => {
  const queryClient = useSecureQueryClient();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      queryClient.setSecureQueryData(['user'], null);
      window.location.href = '/';
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navLinks = [
    { title: 'Home', icon: '/icons/nav-home.svg', onClick: () => router.push('/dashboard') },
    { title: 'Personal Info', icon: '/icons/nav-info.svg', onClick: () => router.push('/dashboard/personal-info') },
    { title: 'Security', icon: '/icons/nav-security.svg', onClick: () => router.push('/dashboard/security') },
    { title: 'Devices', icon: '/icons/device-mobile.svg', onClick: () => console.log('Devices') },
  ];

  return (
    <div className={styles.sidebarContent}>
      {/* 🧹 Contents only. Container is managed by the Sidebar wrapper. */}
      <nav className={styles.nav}>
        <List items={navLinks} variant="link" />
      </nav>

      <button className={styles.logoutBtn} onClick={handleLogout}>
        <Image src="/icons/action-logout.svg" alt="" width={16} height={16} className={styles.logoutIcon} />
        Log Out
      </button>
    </div>
  );
};

export default SidebarTablet;
