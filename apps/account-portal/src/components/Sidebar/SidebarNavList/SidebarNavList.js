'use client';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './SidebarNavList.module.css';

/**
 * SidebarNavList — Reusable Sidebar Navigation List Component
 * @param {Array} items - Array of { title, icon, path, onClick }
 */
export default function SidebarNavList({ items = [] }) {
  const pathname = usePathname();

  return (
    <div className={styles.listGroup}>
      {items.map((item, index) => {
        const isActive = item.path !== '/dashboard' && pathname === item.path;

        return (
          <div 
            key={index} 
            className={`${styles.listItem} ${isActive ? styles.activeItem : ''}`} 
            onClick={item.onClick}
          >
            {item.icon && (
              <div className={styles.iconArea}>
                <Image src={item.icon} alt="" width={20} height={20} className={styles.iconSvg} />
              </div>
            )}
            <div className={styles.content}>
              <span className={styles.title}>{item.title}</span>
            </div>
            <span className={styles.arrow}>›</span>
          </div>
        );
      })}
    </div>
  );
}
