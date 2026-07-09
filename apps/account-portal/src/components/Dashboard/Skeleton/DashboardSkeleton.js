'use client';
import styles from './DashboardSkeleton.module.css';

export default function DashboardSkeleton() {
  return (
    <div className={styles.container}>
      {/* Profile Header Skeleton */}
      <header className={styles.header}>
        <div className={`${styles.shimmer} ${styles.avatarCircle}`}></div>
        <div className={`${styles.shimmer} ${styles.titleBar}`}></div>
        <div className={`${styles.shimmer} ${styles.subtitleBar}`}></div>
      </header>

      {/* Content Section Skeletons */}
      <div className={styles.content}>
        {/* Progress Card Skeleton */}
        <div className={`${styles.shimmer} ${styles.progressCard}`}></div>

        {/* List Skeletons */}
        <div className={styles.section}>
          <div className={`${styles.shimmer} ${styles.sectionTitle}`}></div>
          <div className={styles.list}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${styles.shimmer} ${styles.listItem}`}></div>
            ))}
          </div>
        </div>

        <div className={styles.section}>
          <div className={`${styles.shimmer} ${styles.sectionTitleShort}`}></div>
          <div className={styles.list}>
            <div className={`${styles.shimmer} ${styles.listItem}`}></div>
          </div>
        </div>
      </div>
    </div>
  );
}
