'use client';
import useWindowSize from '../../hooks/useWindowSize';
import LogoFull from './Full/LogoFull';
import LogoIcon from './Icon/LogoIcon';
import styles from './Logo.module.css';

/**
 * Universal Logo Wrapper
 */
const Logo = ({ forceVersion, theme = 'default' }) => {
  const { width } = useWindowSize();

  const renderVariant = () => {
    // If a specific version is forced via props, use it
    if (forceVersion === 'icon') return <LogoIcon theme={theme} />;
    if (forceVersion === 'full') return <LogoFull theme={theme} />;

    // Default responsive behavior
    return width < 768 ? <LogoIcon theme={theme} /> : <LogoFull theme={theme} />;
  };

  return (
    <div className={styles.logoWrapper}>
      {renderVariant()}
    </div>
  );
};

export default Logo;
