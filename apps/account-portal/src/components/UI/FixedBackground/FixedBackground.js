/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import Image from 'next/image';
import styles from './FixedBackground.module.css';

const FixedBackground = () => {
  return (
    <div className={styles.fixedContainer}>
      <Image
        src="/backgrounds/TestBackground.jpg"
        alt=""
        fill
        priority
        className={styles.backgroundImage}
        sizes="100vw"
      />
    </div>
  );
};

export default FixedBackground;
