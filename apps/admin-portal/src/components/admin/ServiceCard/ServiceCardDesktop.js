import React from 'react';
import NextImage from 'next/image';
import Switch from '@/components/admin/Switch/Switch';
import styles from './ServiceCardDesktop.module.css';

/**
 * ServiceCardDesktop - Original premium grid design for large screens
 */
const ServiceCardDesktop = ({ 
  details, 
  onToggleMaintenance, 
  onManage,
  isToggling 
}) => {
  return (
    <div className={details.inMaintenance ? styles.serviceCardMaintMode : styles.serviceCard}>
      <div className={styles.serviceTop}>
        <div className={styles.serviceIcon}>
           {details.icon?.startsWith('/') || details.icon?.startsWith('http') ? (
              <NextImage src={details.icon} width={28} height={28} alt="" />
           ) : (
              <span className="material-symbols-outlined">{details.icon || 'apps'}</span>
           )}
        </div>
        <Switch 
          checked={details.inMaintenance || false} 
          onChange={() => onToggleMaintenance(details._id)}
          disabled={isToggling}
        />
      </div>
      <div className={styles.serviceInfo}>
        <h3>{details.title}</h3>
        <p className={styles.serviceDomain}>{details.userUrl}</p>
      </div>
      <div className={styles.serviceStats}>
        {details.traffic === "High" ? (
          <span className={styles.trafficBadgeWarning}>{details.traffic}</span>
        ) : (
          <span className={styles.trafficBadge}>{details.traffic}</span>
        )}
        <span className={styles.activeCount}>{details.actives} active</span>
      </div>
      <button onClick={() => onManage(details.name)} className={styles.manageBtn}>Manage Hub</button>
    </div>
  );
};

export default ServiceCardDesktop;
