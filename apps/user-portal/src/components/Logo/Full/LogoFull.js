import styles from './LogoFull.module.css';

const LogoFull = ({ theme = 'default' }) => {
  return (
    <div className={`${styles.fullLogoContainer} ${theme === 'monochrome' ? styles.monochrome : ''}`}>
      <div className={styles.iconWrapper}>
        <div className={styles.shield}>
          <div className={styles.innerCloud}></div>
        </div>
      </div>
      <div className={styles.brandName}>
        Cloud-<span className={theme === 'monochrome' ? styles.accentText : styles.blueText}>Base</span>
      </div>
    </div>
  );
};

export default LogoFull;
