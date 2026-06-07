import React from 'react';
import NextImage from 'next/image';
import styles from './StatCardDesktop.module.css';

/**
 * StatCardComponent - For displaying metrics on the dashboard (Desktop)
 * @param {string} icon - Material Symbols icon name OR image path
 * @param {string} value - The big number or percentage
 * @param {string} label - Description of the metric
 * @param {string} badgeText - Small text inside the badge
 * @param {string} variant - 'standard' (default) or 'compact' (mobile optimized)
 * @param {object} badgeStyle - Custom colors for the badge
 * @param {object} iconStyle - Custom colors for the icon box
 */
const StatCardComponent = ({ 
  icon, 
  value, 
  label, 
  badgeText, 
  variant = 'standard',
  badgeStyle = {}, 
  iconStyle = {} 
}) => {
  const isImage = icon && (icon.startsWith('/') || icon.includes('.'));
  const isCompact = variant === 'compact';

  return (
    <div className={`${styles.statCard} ${isCompact ? styles.compact : ''}`}>
      <div className={styles.statTop}>
        <div 
          className={styles.statIcon} 
          style={{ backgroundColor: iconStyle.backgroundColor }}
        >
          {isImage ? (
            <NextImage src={icon} width={isCompact ? 20 : 24} height={isCompact ? 20 : 24} alt={label} />
          ) : (
            <span 
              className="material-symbols-outlined" 
              style={{ 
                color: iconStyle.iconColor || 'inherit',
                fontSize: isCompact ? '20px' : '24px'
              }}
            >
              {icon}
            </span>
          )}
        </div>
        
        {!isCompact && badgeText && (
          <span className={styles.statBadge} style={{ ...badgeStyle }}>
            {badgeText}
          </span>
        )}
      </div>

      <div className={styles.statContent}>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
        {isCompact && badgeText && (
          <span className={styles.statBadgeCompact} style={{ ...badgeStyle }}>
            {badgeText}
          </span>
        )}
      </div>
    </div>
  );
};

export default StatCardComponent;
