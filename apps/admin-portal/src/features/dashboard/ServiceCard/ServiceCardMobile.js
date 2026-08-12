/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import React from 'react';
import NextImage from 'next/image';
import Switch from '@/components/admin/Switch/Switch';
import styles from './ServiceCardMobile.module.css';

/**
 * ServiceCardMobile - Ultra-Compact List-style design
 * Focused on core visibility and toggling
 */
const ServiceCardMobile = React.memo(({ 
  details, 
  onToggleMaintenance, 
  onManage,
  isToggling 
}) => {
  return (
    <div className={`${styles.mobileCard} ${details.inMaintenance ? styles.maintMode : ''}`}>
      <div className={styles.mainContent} onClick={() => onManage(details.name)}>
        <div className={styles.iconBox}>
          {details.icon?.startsWith('/') || details.icon?.startsWith('http') ? (
            <NextImage src={details.icon} width={20} height={20} alt="" />
          ) : (
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>{details.icon || 'apps'}</span>
          )}
        </div>
        
        <div className={styles.infoArea}>
          <div className={styles.titleRow}>
            <h4>{details.title}</h4>
            <div className={`${styles.statusDot} ${styles[details.status || 'optimal']} ${details.inMaintenance ? styles.maintDot : ''}`}></div>
          </div>
          <span className={styles.activeText}>{details.actives} actives</span>
        </div>
      </div>

      <div className={styles.actionArea}>
        <Switch 
          checked={details.inMaintenance || false} 
          onChange={() => onToggleMaintenance(details._id)}
          disabled={isToggling}
        />
      </div>
    </div>
  );
});

export default ServiceCardMobile;
