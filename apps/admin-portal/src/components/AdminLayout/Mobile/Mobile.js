import React from 'react';
import Header from '../../admin/Header/Header';
import Sidebar from '../../admin/Sidebar/Sidebar';
import InfraAlert from '@/features/dashboard/InfraAlert/InfraAlert';
import BottomBar from '../../admin/BottomBar/BottomBar';
import styles from './Mobile.module.css';

/**
 * Mobile Template for Admin Layout
 */
const Mobile = ({
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

      {!isSubPage && <BottomBar />}
    </div>
  );
};

export default Mobile;
