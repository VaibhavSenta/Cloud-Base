/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import React from 'react';
import NextImage from 'next/image';
import { useRouter } from 'next/navigation';
import styles from './Header.module.css';

/**
 * Header Component - Modularized header for CloudBase Admin Console
 * Handles both the main premium header and mobile sub-page headers.
 */
const Header = ({ 
  isSubPage, 
  pageTitle, 
  isSidebarOpen, 
  toggleSidebar, 
  admin 
}) => {
  const router = useRouter();

  return (
    <>
      {/* 1. MOBILE SUB-PAGE HEADER */}
      {isSubPage && (
        <header className={styles.subPageHeader}>
          <button className={styles.backBtn} onClick={() => router.back()}>
            <NextImage src="/admin-images/left-arrow.png" priority width={24} height={24} alt="Back" style={{ filter: 'brightness(0) invert(1)' }} />
          </button>
          <h2 className={styles.subPageTitle}>{pageTitle}</h2>
          <div style={{ width: '40px' }}></div> {/* Spacer to center title */}
        </header>
      )}

      {/* 2. PREMIUM HEADER (Hidden on mobile sub-pages) */}
      <header className={`${styles.header} ${isSubPage ? styles.hideOnMobile : ''}`}>
        <div className={styles.headerWraper}>
          
          <div className={styles.headerLeft}>
            <button className={styles.mobileMenuBtn} onClick={toggleSidebar}>
               {isSidebarOpen ? (
                 <NextImage src="/admin-images/close.png" width={20} height={20} alt="Close" />
               ) : (
                 <NextImage src="/admin-images/menu.png" width={24} height={24} alt="Menu" />
               )}
            </button>
            <h1 className={styles.logoText}>Cloud<span>Base</span></h1>
            
            <div className={styles.networkStatus}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className={styles.statusDot}></div>
                <span className={styles.statusText}>Live Node: Optimal</span>
              </div>
              <div className={styles.statusDivider}></div>
              <span className={styles.latencyText}>12ms</span>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.userSection}>
              <button className={styles.notifBtn}>
                <NextImage src="/admin-images/notification-bell.png" width={20} height={20} alt='Notifications' />
                <span className={styles.notifDot}></span>
              </button>
              <span className={styles.userName}>{admin?.firstname || 'Admin'}</span>
              <div className={styles.userAvatar} onClick={()=> router.push('/profile')}>
                <NextImage src="/admin-icon.png" width={36} height={36} alt="Admin Profile" />
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
