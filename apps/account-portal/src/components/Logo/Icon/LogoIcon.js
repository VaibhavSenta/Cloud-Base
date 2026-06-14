import styles from './LogoIcon.module.css';

const LogoIcon = ({ theme = 'default' }) => {
  return (
    <div className={`${styles.logoContainer} ${theme === 'monochrome' ? styles.monochrome : ''}`}>
      <div className={styles.shield}>
        <div className={styles.innerCloud}></div>
      </div>
      <div className={styles.nodePoint}></div>
    </div>
  );
};

export default LogoIcon;
