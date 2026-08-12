/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import React from 'react';
import NextImage from 'next/image';
import Switch from '@/components/admin/Switch/Switch';
import styles from './SettingsItemDesktop.module.css';

const SettingsItemDesktop = ({ 
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
    <div className={`${styles.settingRow} ${disabled && !loading ? styles.disabled : ''}`}>
      <div className={styles.rowLeft}>
        <div className={styles.iconBox}>
          <NextImage src={icon} width={20} height={20} alt={title} />
        </div>
        <div className={styles.info}>
          <div className={styles.titleLine}>
            <h3>{title}</h3>
            {beta && <span className={styles.betaBadge}>Beta</span>}
          </div>
          <p>{description}</p>
        </div>
      </div>
      <div className={styles.rowRight}>
        {statusText && (
          <span className={styles.statusText} style={{ color: statusColor }}>
            {statusText}
          </span>
        )}
        <Switch 
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default SettingsItemDesktop;
