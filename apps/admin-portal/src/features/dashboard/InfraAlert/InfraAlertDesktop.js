/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import React from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './InfraAlertDesktop.module.css';

/**
 * InfraAlertDesktop Component - Displays critical infrastructure failures for desktop
 * @param {Array} downApps - List of unreachable applications
 */
const InfraAlertDesktop = ({ downApps = [] }) => {
  const router = useRouter();

  if (downApps.length === 0) return null;

  return (
    <div className={styles.alertBox}>
      <div className={styles.alertLeft}>
        <div className={styles.alertIconBox}>
          <NextImage src="/admin-images/warning.png" width={24} height={24} alt="Warning" />
        </div>
        <div className={styles.content}>
          <h4>Infrastructure Alert</h4>
          <p>{downApps.length} system(s) are currently unreachable in the cluster.</p>
          <div className={styles.downList}>
            {downApps.map(app => (
              <span key={app._id} className={styles.downBadge}>
                {app.title}
              </span>
            ))}
          </div>
        </div>
      </div>
      <button onClick={() => router.push('/apps')} className={styles.resolveBtn}>
        Resolve Node Issue
      </button>
    </div>
  );
};

export default InfraAlertDesktop;
