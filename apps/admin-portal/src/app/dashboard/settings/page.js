'use client';

import React from 'react';
import styles from './settings.module.css';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';

const SettingsCategory = ({ icon, title, description, onClick }) => (
  <div className={styles.categoryCard} onClick={onClick}>
    <div className={styles.categoryLeft}>
      <div className={styles.categoryIconBox}>
        <NextImage src={icon} width={24} height={24} alt={title} />
      </div>
      <div className={styles.categoryInfo}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </div>
    <div className={styles.categoryRight}>
      <span className={styles.chevron}>→</span>
    </div>
  </div>
);

export default function SettingsPage() {
  const router = useRouter();

  const categories = [
    {
      id: 'security',
      title: 'Security & Privacy',
      description: 'Manage encryption, audit logs, and access protocols.',
      icon: '/admin-images/verified_user.png',
      path: '/dashboard/settings/security-privacy'
    },
    {
      id: 'system',
      title: 'System Preferences',
      description: 'Configure real-time alerts, display themes, and UI behavior.',
      icon: '/admin-images/smartphone.png',
      path: '/dashboard/settings/system-preferences'
    },
    {
      id: 'data',
      title: 'Data Management',
      description: 'Control session purging, storage limits, and database maintenance.',
      icon: '/admin-images/auto-delete.png',
      path: '/dashboard/settings/data-management'
    }
  ];

  return (
    <div className={styles.settingsMenuContainer}>
        <section className={styles.headerSection}>
          <h1>Global Settings</h1>
          <p>Configure and manage the CloudBase ecosystem protocols.</p>
        </section>

        <div className={styles.categoryList}>
          {categories.map(cat => (
            <SettingsCategory 
              key={cat.id}
              icon={cat.icon}
              title={cat.title}
              description={cat.description}
              onClick={() => router.push(cat.path)}
            />
          ))}
        </div>
      </div>
  );
}
