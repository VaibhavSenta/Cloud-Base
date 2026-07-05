import styles from './CloudSpinner.module.css';

/**
 * CloudSpinner component - A premium hardware-accelerated glowing loader
 * that traces the outline of the Cloud-Base logo cloud geometric shape.
 */
export default function CloudSpinner({ size = 64 }) {
  return (
    <div className={styles.spinnerContainer} style={{ width: size, height: size }}>
      <svg 
        className={styles.svg} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="cloudGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0095f6" stopOpacity="0.1" />
            <stop offset="30%" stopColor="#0095f6" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#0095f6" stopOpacity="1" />
            <stop offset="70%" stopColor="#0095f6" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0095f6" stopOpacity="0.1" />
          </linearGradient>
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* Background static outline */}
        <path
          className={styles.bgPath}
          d="M 25,65 
             A 15,15 0 0,1 35,37
             A 20,20 0 0,1 68,34
             A 14,14 0 0,1 78,65
             Z"
        />
        {/* Animated glowing path */}
        <path
          className={styles.glowPath}
          d="M 25,65 
             A 15,15 0 0,1 35,37
             A 20,20 0 0,1 68,34
             A 14,14 0 0,1 78,65
             Z"
          stroke="url(#cloudGrad)"
          filter="url(#glow)"
        />
      </svg>
    </div>
  );
}
