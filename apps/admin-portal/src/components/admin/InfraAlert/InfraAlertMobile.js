'use client';

import React from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './InfraAlertMobile.module.css';

/**
 * InfraAlertMobile - Card-based design optimized for touch & small screens
 */
const InfraAlertMobile = ({ downApps = [] }) => {
  const router = useRouter();

  if (downApps.length === 0) return null;

  return (
    <div className={styles.mobileAlert}>
      <div className={styles.header}>
        <div className={styles.iconBox}>
          <NextImage src="/admin-images/warning.png" width={20} height={20} alt="Warning" />
        </div>
        <div className={styles.titleArea}>
           <h4>Ecosystem Alert</h4>
           <p>{downApps.length} nodes need attention</p>
        </div>
      </div>
      
      <div className={styles.scrollArea}>
        {downApps.map(app => (
          <div key={app._id} className={styles.nodeCard}>
            <div className={styles.nodeDot}></div>
            <span className={styles.nodeName}>{app.title}</span>
            <span className={styles.nodeStatus}>Offline</span>
          </div>
        ))}
      </div>

      <button onClick={() => router.push('/apps')} className={styles.actionBtn}>
        Open Node Manager
      </button>
    </div>
  );
};

export default InfraAlertMobile;
