'use client';
import { useState } from 'react';
import Header from '../../Header/Header';
import Sidebar from '../../Sidebar/Sidebar';
import styles from './LayoutTablet.module.css';

const LayoutTablet = ({ children, user }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className={styles.container}>
      <Header 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        isSidebarOpen={isSidebarOpen} 
      />

      <div className={styles.layoutBody}>
        <Sidebar user={user} isOpen={isSidebarOpen} />

        <main className={`${styles.mainContent} ${isSidebarOpen ? styles.contentWithSidebar : styles.contentFull}`}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default LayoutTablet;
