'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import HomeStatusCard from '@/components/UI/HomeStatusCard/HomeStatusCard';
import styles from './DashboardTablet.module.css';

/**
 * Tablet View for Dashboard Home (768px <= width < 1024px)
 */
const DashboardTablet = ({ user }) => {
  const router = useRouter();

  const getSafeAvatar = (path) => {
    if (!path || path.includes('..') || path.includes('defaultLogos') || path === '/icons/person.svg' || path.includes('gravatar.com')) {
      return '/user-icon.png';
    }
    return path;
  };

  const activeSessionsCount = user?.sessions?.length || 1;

  return (
    <div className={styles.container}>
      {/* Profile Header */}
      <div className={styles.homeView}>
        <div className={styles.avatarCircleLarge}>
          <Image 
            src={getSafeAvatar(user?.profilePic)} 
            alt="Profile" 
            width={130} 
            height={130} 
            className={styles.avatar} 
            priority 
            unoptimized 
          />
        </div>
        <h1 className={styles.displayFullName}>{user?.firstName} {user?.lastName}</h1>
        <p className={styles.displayEmail}>{user?.email}</p>
      </div>

      {/* 3 Full Rounded Pill Status Cards */}
      <section className={styles.statusSection}>
        <HomeStatusCard 
          iconSrc="/icons/device-mobile.svg"
          title={`${activeSessionsCount} Active Sessions`}
          description="Manage connected devices"
          onClick={() => router.push('/dashboard/security/sessions')}
        />
        <HomeStatusCard 
          iconSrc="/icons/Connected_Services.svg"
          title="Connected Services"
          description="Explore & link apps"
          onClick={() => router.push('/dashboard/connected-services')}
        />
        <HomeStatusCard 
          iconSrc="/icons/Preferences.svg"
          title="Preferences"
          description="UI themes & local backups"
          onClick={() => router.push('/dashboard/preferences')}
        />
      </section>
    </div>
  );
};

export default DashboardTablet;
