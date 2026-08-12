/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import styles from './ActionListMobile.module.css';

/**
 * ActionListMobile — Card-based clickable list for Mobile
 *
 * @param {Array} items - [{ label, badge?, subtitle?, onClick?, variant?, indicator? }]
 *   - label:     string  — Main row text
 *   - badge:     string  — Optional inline tag next to label (e.g. '• This device')
 *   - subtitle:  string  — Optional smaller text below label
 *   - onClick:   func    — Row tap handler
 *   - variant:   'default' | 'danger' — Text color variant
 *   - indicator: 'blue' | 'red' | 'green' | null — Right-side dot
 * @param {Boolean} danger — If true, card gets danger border styling
 */
const ActionListMobile = ({ items = [], danger = false }) => {
  const cardClass = danger
    ? `${styles.card} ${styles.cardDanger}`
    : styles.card;

  return (
    <div className={cardClass}>
      <div className={styles.list}>
        {items.map((item, index) => (
          <div
            key={index}
            className={styles.item}
            onClick={item.onClick}
          >
            <div className={styles.meta}>
              <span className={item.variant === 'danger' ? styles.labelDanger : styles.label}>
                {item.label}
                {item.badge && <span className={styles.badge}>{item.badge}</span>}
              </span>
              {item.subtitle && (
                <span className={styles.subtitle}>{item.subtitle}</span>
              )}
            </div>
            {item.indicator && (
              <div className={styles.controls}>
                <span className={
                  item.indicator === 'blue' ? styles.dotBlue :
                  item.indicator === 'red' ? styles.dotRed :
                  item.indicator === 'green' ? styles.dotGreen :
                  styles.dotBlue
                }></span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionListMobile;
