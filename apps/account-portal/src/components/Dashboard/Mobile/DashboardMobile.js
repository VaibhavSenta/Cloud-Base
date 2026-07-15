'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './DashboardMobile.module.css';
import api from '../../../utils/api';
import { useSecureQueryClient } from '../../../hooks/useSecureQuery';
import ProfileProgress from '../Progress/ProfileProgress';
import List from '../../UI/List/List';

const DashboardMobile = ({ user }) => {
  const queryClient = useSecureQueryClient();
  const router = useRouter();
  
  
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
      queryClient.clear();
      window.location.href = '/';
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const managementLinks = [
    // 🏠 Home removed from mobile as requested (Dashboard is the home)
    { 
      title: 'Personal Information', 
      icon: '/icons/nav-info.svg', 
      onClick: () => router.push('/dashboard/personal-info') 
    },
    { 
      title: 'Signin & Security', 
      icon: '/icons/nav-security.svg', 
      onClick: () => router.push('/dashboard/security') 
    },
    { 
      title: 'Connected Services', 
      icon: '/icons/Connected_Services.svg', 
      onClick: () => router.push('/dashboard/connected-services') 
    },
    { 
      title: 'Preferences', 
      icon: '/icons/Preferences.svg', 
      onClick: () => router.push('/dashboard/preferences') 
    },
  ];

  const devLinks = [
    {
      title: 'Component Sandbox 🛠️',
      icon: '/icons/Preferences.svg',
      onClick: () => router.push('/sandbox')
    }
  ];

  const currentSession = user.sessions?.find(session => session.isCurrent) || user.sessions?.[0];
  const otherSessionsCount = (user.sessions?.length || 0) - (currentSession ? 1 : 0);

  const activeSessions = currentSession ? [{
    title: currentSession.deviceName || 'Unknown Device',
    status: otherSessionsCount > 0 ? `and +${otherSessionsCount} other` : '',
    icon: currentSession.deviceType === 'Mobile' ? '/icons/device-mobile.svg' : '/icons/nav-home.svg',
    sessionId: currentSession.sessionId,
    onClick: () => router.push('/dashboard/security/sessions')
  }] : [];



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
          <h3 className={styles.sectionTitle}>Developer Tools</h3>
          <List items={devLinks} variant="link" />
        </section>

        <section className={styles.section}>
          <h3 className={styles.sectionTitle}>Where you&apos;re logged in</h3>
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
