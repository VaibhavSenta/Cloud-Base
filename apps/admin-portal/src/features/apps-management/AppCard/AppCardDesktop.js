/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import React from 'react';
import NextImage from 'next/image';
import Switch from '@/components/admin/Switch/Switch';
import styles from './AppCardDesktop.module.css';

/**
 * AppCardDesktop - Standard grid design for /apps page
 */
const AppCardDesktop = React.memo(({ 
  app, 
  onToggleMaintenance, 
  onOverview,
  onDashboard,
  isToggling 
}) => {
  return (
    <div className={`${styles.appCard} ${app.inMaintenance ? styles.maintMode : ''}`}>
      <div className={styles.cardHeader}>
        <div className={styles.appIcon}>
              {app.icon?.startsWith('/') || app.icon?.startsWith('http') ? (
                 <NextImage fill src={app.icon} alt={app.title} sizes="56px" style={{ objectFit: 'contain', padding: '10px' }} />
              ) : (
                 <span className="material-symbols-outlined">{app.icon || 'apps'}</span>
              )}
        </div>
        <div className={styles.statusBadge}>
          <div className={`${styles.statusDot} ${styles[app.status || 'optimal']}`}></div>
          <span>{app.status || 'Optimal'}</span>
        </div>
      </div>

      <div className={styles.appInfo}>
        <h3>{app.title}</h3>
        <p className={styles.appUrl}>{app.userUrl}</p>
      </div>

      <div className={styles.appMetrics}>
        <div className={styles.metricItem}>
          <span className={styles.metricValue}>{app.actives}</span>
          <span className={styles.metricLabel}>Users</span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricValue}>{app.latency || '12ms'}</span>
          <span className={styles.metricLabel}>Latency</span>
        </div>
        <div className={styles.metricItem}>
          <span className={styles.metricValue}>{app.version}</span>
          <span className={styles.metricLabel}>Version</span>
        </div>
      </div>

      <div className={styles.cardActions}>
        <div className={styles.toggleSection}>
          <span>Maint. Mode</span>
          <label className={styles.switch}>
            <input 
              type="checkbox"
              checked={app.inMaintenance || false} 
              onChange={() => onToggleMaintenance(app._id)}
              disabled={isToggling}
            />
            <span className={styles.slider}></span>
          </label>
        </div>
        
        <div className={styles.btnGroup}>
          <button 
            onClick={() => onOverview(app.name)}
            className={styles.actionBtn}
          >
            Overview
          </button>
          <button 
            onClick={() => onDashboard(app.name)}
            className={`${styles.actionBtn} ${styles.primaryBtn}`}
          >
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
});

export default AppCardDesktop;
