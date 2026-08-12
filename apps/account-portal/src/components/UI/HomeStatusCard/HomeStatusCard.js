/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import Image from 'next/image';
import styles from './HomeStatusCard.module.css';

/**
 * HomeStatusCard — Universal Full Rounded Pill Status Card Component
 * Icon on the left, title & description stacked on the right.
 */
export default function HomeStatusCard({ iconSrc, title, description, onClick }) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.iconWrapper}>
        <Image 
          src={iconSrc} 
          alt={title} 
          width={18} 
          height={18} 
          className={styles.iconSvg} 
        />
      </div>
      <div className={styles.textGroup}>
        <h4 className={styles.title}>{title}</h4>
        <p className={styles.description}>{description}</p>
      </div>
    </div>
  );
}
