/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import React from 'react';
import Header from '../../admin/Header/Header';
import Sidebar from '../../admin/Sidebar/Sidebar';
import InfraAlert from '@/features/dashboard/InfraAlert/InfraAlert';
import styles from './Desktop.module.css';

/**
 * Desktop Template for Admin Layout
 */
const Desktop = ({
  children,
  isSidebarOpen,
  toggleSidebar,
  closeSidebar,
  isMaintActive,
  handleMaintToggle,
  isMaintLoading,
  handleLogout,
  admin,
  downApps,
  isSubPage,
  pageTitle
}) => {
  return (
    <div className={styles.layoutRoot}>
      <div className={styles.titleBar}></div>
      
      <Header 
        isSubPage={isSubPage}
        pageTitle={pageTitle}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        admin={admin}
      />

      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        isMaintActive={isMaintActive}
        handleMaintToggle={handleMaintToggle}
        isMaintLoading={isMaintLoading}
        handleLogout={handleLogout}
      />

      <main className={`${styles.mainContent} ${isSubPage ? styles.subPageContent : ''}`}>
        <InfraAlert downApps={downApps} />
        {children}
      </main>
    </div>
  );
};

export default Desktop;
