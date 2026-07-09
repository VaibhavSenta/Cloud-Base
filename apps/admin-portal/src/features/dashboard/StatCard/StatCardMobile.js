import React from 'react';
import NextImage from 'next/image';
import styles from './StatCardMobile.module.css';

/**
 * StatCardMobile - Mobile specific design
 * Compact, horizontal layout with high touch-target efficiency
 */
const StatCardMobile = React.memo(({ 
  icon, 
  value, 
  label, 
  badgeText, 
  badgeStyle = {}, 
  iconStyle = {} 
}) => {
  const isImage = icon && (icon.startsWith('/') || icon.includes('.'));

  return (
    <div className={styles.mobileCard}>
      <div 
        className={styles.iconBox} 
        style={{ backgroundColor: iconStyle.backgroundColor }}
      >
        {isImage ? (
          <NextImage src={icon} width={22} height={22} alt={label} />
        ) : (
          <span 
            className="material-symbols-outlined" 
            style={{ color: iconStyle.iconColor || 'inherit', fontSize: '22px' }}
          >
            {icon}
          </span>
        )}
      </div>

      <div className={styles.content}>
        <div className={styles.topRow}>
          <p className={styles.value}>{value}</p>
          {badgeText && (
            <span className={styles.badge} style={{ ...badgeStyle }}>
              {badgeText}
            </span>
          )}
        </div>
        <p className={styles.label}>{label}</p>
      </div>
    </div>
  );
});

export default StatCardMobile;
