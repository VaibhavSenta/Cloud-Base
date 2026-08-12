/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from './DashboardDesktop.module.css';

const DashboardDesktop = ({ user }) => {
  const router = useRouter();
  const [greeting, setGreeting] = useState('Welcome');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 17) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const getSafeAvatar = (path) => {
    if (!path || path.includes('..') || path.includes('defaultLogos') || path === '/icons/person.svg' || path.includes('gravatar.com')) {
      return '/user-icon.png';
    }
    return path;
  };

  const activeSessionsCount = user.sessions?.length || 1;

  return (
    <div className={styles.container}>
      {/* 🚀 Welcoming Header */}
      <header className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1 className={styles.greeting}>{greeting}, {user?.firstName || 'Guest'}</h1>
          <p className={styles.subGreeting}>Your personal account is secure and fully encrypted.</p>
        </div>
      </header>

      {/* 👤 Centered Profile Section */}
      <div className={styles.profileCentered}>
        <div className={styles.avatarCircleLarge}>
          <img 
            src={getSafeAvatar(user?.profilePic)} 
            alt="Profile" className={styles.avatar}
            onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/user-icon.png'; }}
          />
        </div>
        <h2 className={styles.displayFullName}>{user?.firstName} {user?.lastName}</h2>
        <p className={styles.displayEmail}>{user?.email}</p>
      </div>

      {/* 🛡️ Status Metrics Section */}
      <section className={styles.statusSection}>
        <div className={styles.statusCard} onClick={() => router.push('/dashboard/security')}>
          <div className={styles.statusIconArea}>
            <Image src="/icons/device-mobile.svg" alt="Devices" width={18} height={18} className={styles.statusSvg} />
          </div>
          <div className={styles.statusText}>
            <h4>{activeSessionsCount} Active Sessions</h4>
            <p>Manage connected devices</p>
          </div>
        </div>

        <div className={styles.statusCard} onClick={() => router.push('/dashboard/connected-services')}>
          <div className={styles.statusIconArea}>
            <Image src="/icons/Connected_Services.svg" alt="Connected Services" width={18} height={18} className={styles.statusSvg} />
          </div>
          <div className={styles.statusText}>
            <h4>Connected Services</h4>
            <p>Explore & link apps</p>
          </div>
        </div>

        <div className={styles.statusCard} onClick={() => router.push('/dashboard/preferences')}>
          <div className={styles.statusIconArea}>
            <Image src="/icons/Preferences.svg" alt="Preferences" width={18} height={18} className={styles.statusSvg} />
          </div>
          <div className={styles.statusText}>
            <h4>Preferences</h4>
            <p>UI themes & local backups</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DashboardDesktop;
