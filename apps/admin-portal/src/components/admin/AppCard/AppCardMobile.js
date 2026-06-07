import React from 'react';
import NextImage from 'next/image';
import styles from './AppCardMobile.module.css';

/**
 * AppCardMobile - Ultra-Compact redesign for /apps page
 * Focuses on vertical space saving and high-density information
 */
const AppCardMobile = ({ 
  app, 
  onToggleMaintenance, 
  onOverview,
  onDashboard,
  isToggling 
}) => {
  return (
    <div className={`${styles.cardContainer} ${app.inMaintenance ? styles.maintMode : ''}`}>
      <div className={styles.mainRow} onClick={() => onDashboard(app.name)}>
        <div className={styles.appIdentity}>
          <div className={styles.iconBox}>
            {app.icon?.startsWith('/') || app.icon?.startsWith('http') ? (
              <NextImage src={app.icon} width={24} height={24} alt="" />
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{app.icon || 'apps'}</span>
            )}
          </div>
          <div className={styles.infoArea}>
            <div className={styles.titleLine}>
               <h4>{app.title}</h4>
               <div className={`${styles.statusDot} ${styles[app.status || 'optimal']}`}></div>
            </div>
            <div className={styles.miniMetrics}>
               <span>{app.actives} users</span>
               <span className={styles.dotSeparator}>•</span>
               <span>{app.latency || '12ms'}</span>
               <span className={styles.dotSeparator}>•</span>
               <span className={styles.versionText}>v{app.version}</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.actionStrip}>
        <button onClick={() => onOverview(app.name)} className={styles.textBtn}>Overview</button>
        <div className={styles.btnDivider}></div>
        <button onClick={() => onDashboard(app.name)} className={`${styles.textBtn} ${styles.highlight}`}>Open Console</button>
      </div>
    </div>
  );
};

export default AppCardMobile;
