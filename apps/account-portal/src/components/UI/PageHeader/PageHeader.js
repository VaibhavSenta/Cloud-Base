/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import styles from './PageHeader.module.css';

/**
 * PageHeader Component — Universal standardized header for page titles and subtitles
 *
 * @param {string} title - Main page heading
 * @param {string} subtitle - Secondary description text
 * @param {string} className - Additional container class
 */
export default function PageHeader({ title, subtitle, className = '' }) {
  return (
    <header className={`${styles.header} ${className}`}>
      <h1 className={styles.title}>{title}</h1>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </header>
  );
}
