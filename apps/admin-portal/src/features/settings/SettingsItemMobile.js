/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import React from 'react';
import NextImage from 'next/image';
import Switch from '@/components/admin/Switch/Switch';
import styles from './SettingsItemMobile.module.css';

const SettingsItemMobile = ({ 
  icon, 
  title, 
  description, 
  statusText, 
  statusColor,
  checked, 
  onChange, 
  disabled, 
  loading,
  beta 
}) => {
  return (
    <div className={`${styles.mobileRow} ${disabled && !loading ? styles.disabled : ''}`}>
      <div className={styles.topArea}>
        <div className={styles.leftInfo}>
          <div className={styles.iconBox}>
            <NextImage src={icon} width={18} height={18} alt={title} />
          </div>
          <div className={styles.titleArea}>
            <div className={styles.titleLine}>
               <h4>{title}</h4>
               {beta && <span className={styles.beta}>Beta</span>}
            </div>
            {statusText && (
              <span className={styles.status} style={{ color: statusColor }}>
                {statusText}
              </span>
            )}
          </div>
        </div>
        <div className={styles.action}>
          <Switch 
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            loading={loading}
            size="small"
          />
        </div>
      </div>
      <p className={styles.desc}>{description}</p>
    </div>
  );
};

export default SettingsItemMobile;
