'use client';
import Image from 'next/image';
import styles from './ListMobile.module.css';
import { useRouter } from 'next/navigation';

const ListMobile = ({ items, variant = 'link' }) => {
  const router = useRouter();
  
  
  return (
    <div className={styles.listGroup}>
      
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

export default ListMobile;
