'use client';
import { useEffect, useState } from 'react';
import styles from './WelcomeScreen.module.css';

const WelcomeScreen = ({ onComplete }) => {
  const [phase, setPhase] = useState('entering');

  useEffect(() => {
    // Phase transitions
    const timer1 = setTimeout(() => setPhase('stable'), 500);
    const timer2 = setTimeout(() => setPhase('exiting'), 1500);
    const timer3 = setTimeout(() => {
      if (onComplete) onComplete();
    }, 2000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  return (
    <div className={`${styles.container} ${styles[phase]}`}>
      <div className={styles.content}>
        <div className={styles.brandContainer}>
          <span className={styles.subText}>initializing</span>
          <h1 className={styles.brandTitle}>CLOUD-BASE</h1>
        </div>
        <p className={styles.welcomeMsg}>Welcome to your secure space</p>
      </div>
    </div>
  );
};

export default WelcomeScreen;
