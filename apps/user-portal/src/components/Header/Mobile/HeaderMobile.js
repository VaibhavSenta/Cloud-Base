'use client';

import styles from './HeaderMobile.module.css';

export default function HeaderMobile({ title, leftAction, rightAction }) {
  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {leftAction}
      </div>
      <div className={styles.center}>
        <h1 className={styles.title}>{title || 'Nothing Box'}</h1>
      </div>
      <div className={styles.right}>
        {rightAction}
      </div>
    </header>
  );
}
