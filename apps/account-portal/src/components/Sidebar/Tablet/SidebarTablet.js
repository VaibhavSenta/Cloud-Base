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
      queryClient.clear();
      window.location.href = '/';
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const navLinks = [
    { title: 'Home', icon: '/icons/nav-home.svg', onClick: () => router.push('/dashboard') },
    { title: 'Personal Info', icon: '/icons/nav-info.svg', onClick: () => router.push('/dashboard/personal-info') },
    { title: 'Security', icon: '/icons/nav-security.svg', onClick: () => router.push('/dashboard/security') },
    { title: 'Devices', icon: '/icons/device-mobile.svg', onClick: () => router.push('/dashboard/security') },
    { title: 'Connected Services', icon: '/icons/Connected_Services.svg', onClick: () => router.push('/dashboard/connected-services') },
    { title: 'Preferences', icon: '/icons/Preferences.svg', onClick: () => router.push('/dashboard/preferences') },
  ];

  const devLinks = [
    { title: 'Sandbox 🛠️', icon: '', onClick: () => router.push('/sandbox') }
  ];

  return (
    <div className={styles.sidebarContent}>
      {/* 🧹 Contents only. Container is managed by the Sidebar wrapper. */}
      <nav className={styles.nav}>
        <List items={navLinks} variant="link" />

        <div style={{ marginTop: '1.5rem', paddingTop: '1.25rem', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <span style={{ fontSize: '0.65rem', color: '#888888', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', display: 'block', marginBottom: '0.4rem', paddingLeft: '0.4rem' }}>
            Developer
          </span>
          <List items={devLinks} variant="link" />
        </div>
      </nav>

      <button className={styles.logoutBtn} onClick={handleLogout}>
        <Image src="/icons/action-logout.svg" alt="" width={16} height={16} className={styles.logoutIcon} />
        Log Out
      </button>
    </div>
  );
};

export default SidebarTablet;
