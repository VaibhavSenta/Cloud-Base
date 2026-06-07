import React from 'react';
import styles from './SettingsGroup.module.css';

const SettingsGroup = ({ title, children }) => {
  return (
    <div className={styles.settingsGroup}>
      <div className={styles.groupHeader}>
        <h2>{title}</h2>
      </div>
      <div className={styles.groupContent}>
        {children}
      </div>
    </div>
  );
};

export default SettingsGroup;
