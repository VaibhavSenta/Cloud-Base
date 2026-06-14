'use client';
import Image from 'next/image';
import styles from './DashboardMobile.module.css';
import api from '../../../utils/api';
import { useQueryClient } from '@tanstack/react-query';
import ProfileProgress from '../Progress/ProfileProgress';
import List from '../../UI/List/List';

const DashboardMobile = ({ user }) => {
  const queryClient = useQueryClient();
  
  if (!user) {
    return <div className={styles.container}>Loading profile...</div>;
  }

  const getSafeAvatar = (path) => {
    if (!path || path.includes('..') || path.includes('defaultLogos')) {
      return '/icons/person.svg';
    }
    return path;
  };

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
      queryClient.setQueryData(['user'], null);
      window.location.href = '/';
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const managementLinks = [
    { title: 'Home', icon: '/icons/nav-home.svg', onClick: () => console.log('Home') },
    { title: 'Personal Information', icon: '/icons/nav-info.svg', onClick: () => console.log('Info') },
    { title: 'Signin & Security', icon: '/icons/nav-security.svg', onClick: () => console.log('Security') },
  ];

  const activeSessions = user.sessions?.map(session => ({
    title: session.deviceName || 'Unknown Device',
    status: session.isCurrent ? 'Active now' : `Last active: ${new Date(session.lastActive).toLocaleDateString()}`,
    icon: session.deviceType === 'Mobile' ? '/icons/device-mobile.svg' : '/icons/nav-home.svg',
    sessionId: session.sessionId
  })) || [];

  return (
    <div className={styles.homeView}>
      <header className={styles.profileHeader}>
        <div className={styles.avatarCircle}>
          <Image 
            src={getSafeAvatar(user?.profilePic)} 
            alt="Profile" width={120} height={120} className={styles.avatar} priority
          />
        </div>
        <h1 className={styles.userName}>{user?.firstName} {user?.lastName}</h1>
        <p className={styles.userEmail}>{user?.email}</p>
      </header>

      <div className={styles.contentBlock}>
        <ProfileProgress user={user} />

        <section className={styles.section}>
          <List items={managementLinks} variant="link" />
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Where you're logged in</h3>
          <List items={activeSessions} variant="status" />
        </section>

        <footer className={styles.footer}>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            <Image src="/icons/action-logout.svg" alt="" width={20} height={20} className={styles.btnIconSvg} />
            Log Out
          </button>
        </footer>
      </div>
    </div>
  );
};

export default DashboardMobile;
