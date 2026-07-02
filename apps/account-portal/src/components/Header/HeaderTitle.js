'use client';
import styles from './HeaderTitle.module.css';

/**
 * HeaderTitle Component
 * Dynamically switches styling between primary brand title and subpage category names.
 */
export default function HeaderTitle({ isSubpage, title, breadcrumb, isFirstLevelSubpage }) {
  if (isSubpage) {
    return (

      <div className={`${styles.headerTitle} ${isFirstLevelSubpage ? styles.animateEntrance : ''}`}>

        <div className={styles.subpageTitle}>
          {title}
          {breadcrumb && (
            <div className={styles.pageHistory}>
              {breadcrumb}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div>

      <span className={styles.dashboardTitle}>
        Cloud-Base
      </span>
    </div>
  );
}
