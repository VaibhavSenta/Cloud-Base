/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import Image from 'next/image';
import styles from './ListDesktop.module.css';

const ListDesktop = ({ items, variant = 'link' }) => {
  return (
    <div className={styles.listGroup} style={{ maxWidth: '600px' }}>
      {items.map((item, index) => (
        <div key={index} className={styles.listItem} onClick={item.onClick}>
          {item.icon && (
            <div className={styles.iconArea}>
              <Image src={item.icon} alt="" width={24} height={24} />
            </div>
          )}
          <div className={styles.content}>
            <span className={styles.title}>{item.title}</span>
            {variant === 'status' && item.status && (
              <span className={styles.status}>{item.status}</span>
            )}
          </div>
          {variant === 'link' && <span className={styles.arrow}>›</span>}
        </div>
      ))}
    </div>
  );
};

export default ListDesktop;
