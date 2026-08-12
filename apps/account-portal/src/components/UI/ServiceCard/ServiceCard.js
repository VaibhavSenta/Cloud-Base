/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import styles from './ServiceCard.module.css';

/**
 * ServiceCard — Reusable App Store style service card
 *
 * @param {string} title — Service title (e.g. 'Cloud Vault')
 * @param {string} tagline — Short description/tagline
 * @param {string} actionType — 'get' (pill button) or 'arrow' (icon)
 * @param {string} actionText — Text inside action button (default: 'GET')
 * @param {function} onClick — Click callback
 */
export default function ServiceCard({
  title,
  tagline,
  actionType = 'get',
  actionText = 'GET',
  onClick
}) {
  return (
    <div className={styles.card} onClick={onClick}>
      <div className={styles.info}>
        <span className={styles.title}>{title}</span>
        {tagline && <span className={styles.tagline}>{tagline}</span>}
      </div>
      {actionType === 'arrow' ? (
        <span className={styles.arrowIcon}>→</span>
      ) : (
        <button className={styles.getBtn} onClick={onClick}>
          {actionText}
        </button>
      )}
    </div>
  );
}
