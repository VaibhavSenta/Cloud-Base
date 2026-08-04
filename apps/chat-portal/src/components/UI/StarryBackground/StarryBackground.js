'use client';

import styles from './StarryBackground.module.css';

export default function StarryBackground() {
  return (
    <div className={styles.container}>
      <div className={styles.stars1} />
      <div className={styles.stars2} />
      <div className={styles.stars3} />
      <div className={styles.shootingStar} />
    </div>
  );
}
