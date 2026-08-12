/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import Image from 'next/image';
import styles from './ExploreCard.module.css';

/**
 * ExploreCard Component — Reusable Card for Available & Connected Services
 *
 * @param {string} name - Service name (e.g. 'Cloud Vault')
 * @param {string} category - Category tagline (e.g. 'STORAGE & SYNC')
 * @param {string} description - Detailed service description
 * @param {string} logoUrl - Optional image URL for logo
 * @param {string} monogram - Optional 2-letter fallback monogram (e.g. 'CV')
 * @param {boolean} isConnected - True if user has connected this service
 * @param {function} onConnect - Click callback for 'Connect Service'
 * @param {function} onManage - Click callback for 'Manage Settings'
 */
export default function ExploreCard({
  name,
  category = 'CLOUD SERVICE',
  description,
  logoUrl,
  monogram,
  isConnected = false,
  onConnect,
  onManage
}) {
  const fallbackMonogram = monogram || (name ? name.split(' ').map(n => n[0]).join('').slice(0, 2) : 'CS');

  return (
    <div className={styles.card}>
      {/* Top Header Row: Logo + Title + Status Badge */}
      <div className={styles.topRow}>
        <div className={styles.serviceHeader}>
          {/* Logo / Monogram Container */}
          <div className={styles.logoContainer}>
            {logoUrl ? (
              <Image 
                src={logoUrl} 
                alt={name} 
                width={44} 
                height={44} 
                className={styles.logoImage}
                unoptimized
              />
            ) : (
              <span className={styles.logoMonogram}>{fallbackMonogram}</span>
            )}
          </div>

          <div className={styles.titleGroup}>
            <h3 className={styles.serviceTitle}>{name}</h3>
            <span className={styles.categoryTag}>{category}</span>
          </div>
        </div>

        {/* Status Badge */}
        <span className={isConnected ? styles.statusBadgeConnected : styles.statusBadgeAvailable}>
          {isConnected ? 'Connected' : 'Available'}
        </span>
      </div>

      {/* Description */}
      <p className={styles.description}>{description}</p>

      {/* Action Button */}
      <div className={styles.actionRow}>
        {isConnected ? (
          <button onClick={onManage} className={styles.manageBtn}>
            Manage Settings
          </button>
        ) : (
          <button onClick={onConnect} className={styles.connectBtn}>
            Connect
          </button>
        )}
      </div>
    </div>
  );
}
