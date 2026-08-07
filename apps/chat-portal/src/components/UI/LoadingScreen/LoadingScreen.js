'use client';

import styles from './LoadingScreen.module.css';
import StarryBackground from '@/components/UI/StarryBackground/StarryBackground';

export default function LoadingScreen() {
  return (
    <>
      <StarryBackground />
      <div className={styles.wrapper}>
        <div className={styles.brand}>Nothing Box</div>
      </div>
    </>
  );
}
