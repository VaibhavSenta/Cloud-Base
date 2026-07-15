'use client';
import Image from 'next/image';
import styles from './DashboardTablet.module.css';

const DashboardTablet = ({ user }) => {
  const getSafeAvatar = (path) => {
    if (!path || path.includes('..') || path.includes('defaultLogos') || path === '/icons/person.svg') {
      return '/icons/default-avatar.jpg';
    }
    return path;
  };

  return (
    <div className={styles.homeView}>
      <div className={styles.avatarCircleLarge}>
        <Image src={getSafeAvatar(user?.profilePic)} alt="Profile" width={120} height={120} className={styles.avatar} priority />
      </div>
      <h1 className={styles.displayFullName}>{user?.firstName} {user?.lastName}</h1>
      <p className={styles.displayEmail}>{user?.email}</p>
    </div>
  );
};

export default DashboardTablet;
