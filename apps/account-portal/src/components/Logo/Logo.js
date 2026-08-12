/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import useWindowSize from '../../hooks/useWindowSize';
import LogoFull from './Full/LogoFull';
import LogoIcon from './Icon/LogoIcon';
import styles from './Logo.module.css';

/**
 * Universal Logo Wrapper
 */
const Logo = ({ forceVersion, theme = 'default', className }) => {
  const { width } = useWindowSize();

  const renderVariant = () => {
    // If a specific version is forced via props, use it
    if (forceVersion === 'icon') return <LogoIcon theme={theme} />;
    if (forceVersion === 'full') return <LogoFull theme={theme} />;

    // Default responsive behavior
    return width < 768 ? <LogoIcon theme={theme} /> : <LogoFull theme={theme} />;
  };

  return (
    <div className={`${styles.logoWrapper} ${className || ''}`}>
      {renderVariant()}
    </div>
  );
};

export default Logo;
