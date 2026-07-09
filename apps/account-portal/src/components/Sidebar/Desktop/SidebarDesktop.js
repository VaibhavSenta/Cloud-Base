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

  const devLinks = [
    { title: 'Component Sandbox 🛠️', icon: '', onClick: () => router.push('/sandbox') }
  ];

  return (
    <div className={styles.sidebarContent}>
      <nav className={styles.nav}>
        <List items={navLinks} variant="link" />

        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <span style={{ fontSize: '0.7rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', display: 'block', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>
            Developer Tools
          </span>
          <List items={devLinks} variant="link" />
        </div>
      </nav>

      <button className={styles.logoutBtn} onClick={handleLogout}>
        <Image src="/icons/action-logout.svg" alt="" width={18} height={18} className={styles.logoutIconSvg} />
        Sign Out
      </button>
    </div>
  );
};

export default SidebarDesktop;
