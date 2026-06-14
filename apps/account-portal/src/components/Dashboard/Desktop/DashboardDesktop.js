'use client';
import Image from 'next/image';
import styles from './DashboardDesktop.module.css';

const DashboardDesktop = ({ user }) => {
  const getSafeAvatar = (path) => {
    if (!path || path.includes('..') || path.includes('defaultLogos')) {
      return '/icons/person.svg';
    }
    return path;
  };

  return (
    <div className={styles.homeView}>
      <div className={styles.avatarCircleLarge}>
        <Image src={getSafeAvatar(user?.profilePic)} alt="Profile" width={150} height={150} className={styles.avatar} priority />
      </div>
      <h1 className={styles.displayFullName}>{user?.firstName} {user?.lastName}</h1>
      <p className={styles.displayEmail}>{user?.email}</p>
    </div>
  );
};

export default DashboardDesktop;
