'use client';
import useWindowSize from '../../hooks/useWindowSize';
import Logo from '../Logo/Logo';
import styles from './Header.module.css';

/**
 * Universal Unified Header
 * Admin Portal Style: Floating Pill Container
 */
const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  const { width } = useWindowSize();

  return (
    <div className={styles.headerWrapper}>
      <header className={styles.header}>
        {/* 🚀 Left Area: Logo & Toggle (Tablet/Mobile) */}
        <div className={styles.leftGroup}>
          <div className={styles.logoArea}>
            <span>
          {width < 1024 && onToggleSidebar && (
            <button 
              className={styles.toggleBtn} 
              onClick={onToggleSidebar}
              aria-label="Toggle Sidebar"
            >
              <div className={`${styles.hamburger} ${isSidebarOpen ? styles.active : ''}`}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </button>
          )}
            </span>
            <Logo forceVersion="icon" theme="monochrome" />
          </div>
        </div>
        
        {/* 💎 Center Area: Brand Text */}
        <div className={styles.titleArea}>
          <span className={styles.brandText}>Cloud-Base</span>
        </div>

        {/* 🛡️ Right Area: Spacer for Balance */}
        <div className={styles.spacer}></div>
      </header>
    </div>
  );
};

export default Header;
