'use client';
import Logo from '../../Logo/Logo';
import styles from './LoadingScreen.module.css';

const LoadingScreen = ({ fullScreen = true }) => {
  const brandName = "NOTHING BOX";

  return (
    <div className={`${styles.container} ${fullScreen ? styles.fullScreen : styles.inline}`}>
      <div className={styles.loaderWrapper}>
        {/* Outer dashed spinning ring */}
        <div className={styles.orbitRing}></div>

        {/* Orbiting nodes */}
        <div className={styles.orbitNodeOne}></div>
        <div className={styles.orbitNodeTwo}></div>

        {/* Dynamic neon breath glow */}
        <div className={styles.auraGlow}></div>

        {/* Center floating logo */}
        <div className={styles.logoWrapper}>
          <Logo forceVersion="icon" />
        </div>
      </div>

      {/* Wave pulsing logo text */}
      <div className={styles.statusText}>
        {brandName.split('').map((char, index) => (
          <span 
            key={index} 
            style={{ animationDelay: `${index * 0.12}s` }}
          >
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};

export default LoadingScreen;
