/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { usePathname } from 'next/navigation';
import Switch from '../Switch/Switch';
import styles from './Sidebar.module.css';

const Sidebar = ({ 
  isOpen, 
  onClose, 
  isMaintActive, 
  handleMaintToggle, 
  isMaintLoading, 
  isToggling,
  handleLogout 
}) => {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkWidth = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkWidth();
    window.addEventListener('resize', checkWidth);
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  const handleNavClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  return (
    <>
      {isOpen && <div className={styles.backdrop} onClick={onClose} />}

      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarActive : ''}`}>
        <div className={styles.sidebarWrapper}>
          <div className={styles.sidebarLogoSection}>
            <div className={styles.logoWrapper}>
              <span className={styles.sidebarLogoText}>Cloud Base</span>
            </div>
            
            <div className={styles.profileSnippet}>
              <div className={styles.profileIconBox}>
                 <span style={{ fontSize: '20px', fontWeight: '800', color: '#00424f' }}>@</span>
              </div>
              <div className={styles.profileInfo}>
                <p className={styles.adminLabel}>System Admin</p>
                <p className={styles.accessLabel}>Root Access</p>
              </div>
            </div>
            <div className={styles.nodeBadge}>
              <div className={styles.maintModeHeader}>
                <span className={styles.maintLabel}>Global Maint. Mode</span>
                <Switch 
                  checked={isMaintActive} 
                  onChange={(e) => handleMaintToggle(e)} 
                  disabled={isMaintLoading || isToggling}
                />
              </div>
            </div>
          </div>

          <nav className={styles.navList}>
            <Link 
              href="/dashboard" 
              className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`} 
              onClick={handleNavClick}
            >
              <NextImage src="/admin-images/dashboard.png" width={20} height={20} alt="" />
              <span>Dashboard</span>
            </Link>
            <Link 
              href="/apps" 
              className={`${styles.navItem} ${pathname === '/apps' ? styles.active : ''}`} 
              onClick={handleNavClick}
            >
              <NextImage src="/admin-images/hub.png" width={20} height={20} alt="" />
              <span>Apps</span>
            </Link>
            <Link 
              href="/dashboard/users" 
              className={`${styles.navItem} ${pathname === '/dashboard/users' ? styles.active : ''}`} 
              onClick={handleNavClick}
            >
              <NextImage src="/admin-images/users.png" width={20} height={20} alt="" />
              <span>Users</span>
            </Link>
            <Link 
              href="/logs" 
              className={`${styles.navItem} ${pathname === '/logs' ? styles.active : ''}`} 
              onClick={handleNavClick}
            >
              <NextImage src="/admin-images/history_edu.png" width={20} height={20} alt="" />
              <span>Logs</span>
            </Link>
          </nav>

          <div className={styles.bottomNav}>
            <div className={styles.navList} style={{ border: 'none', outline: 'none', padding: 0 }}>
              <Link 
                href="/dashboard/settings" 
                className={`${styles.navItem} ${pathname === '/dashboard/settings' ? styles.active : ''}`} 
                onClick={handleNavClick}
              >
                <span>Settings</span>
              </Link>
              <Link 
                href="/profile" 
                className={`${styles.navItem} ${pathname === '/profile' ? styles.active : ''}`} 
                onClick={handleNavClick}
              >
                <span>Profile</span>
              </Link>
            </div>

          </div>

          <button className={styles.logoutBtn} onClick={handleLogout}>
              <NextImage src="/admin-images/logout.png" width={18} height={18} alt="" />
              <span>Logout Console</span>
          </button>
          
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
