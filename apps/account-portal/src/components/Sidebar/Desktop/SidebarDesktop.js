'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './SidebarDesktop.module.css';
import List from '../../UI/List/List';
import api from '../../../utils/api';
import { useSecureQueryClient } from '../../../hooks/useSecureQuery';

const SidebarDesktop = ({ user }) => {
  const queryClient = useSecureQueryClient();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      queryClient.clear();
      window.location.href = '/';
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navLinks = [
    { title: 'Home', icon: '/icons/nav-home.svg', onClick: () => router.push('/dashboard') },
    { title: 'Personal Information', icon: '/icons/nav-info.svg', onClick: () => router.push('/dashboard/personal-info') },
    { title: 'Signin & Security', icon: '/icons/nav-security.svg', onClick: () => router.push('/dashboard/security') },
    { title: 'Logged Devices', icon: '/icons/device-mobile.svg', onClick: () => router.push('/dashboard/security') },
    { title: 'Connected Services', icon: '/icons/Connected_Services.svg', onClick: () => router.push('/dashboard/connected-services') },
    { title: 'Preferences', icon: '/icons/Preferences.svg', onClick: () => router.push('/dashboard/preferences') },
  ];


  return (
    <div className={styles.sidebarContent}>
      <nav className={styles.nav}>
        <List items={navLinks} variant="link" />

      </nav>

      <button className={styles.logoutBtn} onClick={handleLogout}>
        <Image src="/icons/action-logout.svg" alt="" width={18} height={18} className={styles.logoutIconSvg} />
        Sign Out
      </button>
    </div>
  );
};

export default SidebarDesktop;
