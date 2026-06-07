'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import styles from './AdminLayout.module.css';
import InfraAlert from '../InfraAlert/InfraAlert';
import Sidebar from '../Sidebar/Sidebar';

export default function AdminLayout({ children }) {

  const router = useRouter();
  const queryClient = useQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMaintActive, setIsMaintActive] = useState(false);
  const pathname = usePathname();

  // 1. Fetch Admin Profile
  const { data: admin } = useQuery({
    queryKey: ['adminProfile'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/profile');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000, 
  });

  // 2. 🚧 Fetch Global Maintenance State
  const { data: globalMaint, isLoading: isMaintLoading } = useQuery({
    queryKey: ['globalMaintenance'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/dashboard/config/maintenance');
      return res.data.value;
    }
  });

  // Sync local state when query data changes
  useEffect(() => {
    if (globalMaint !== undefined) {
      setIsMaintActive(globalMaint);
    }
  }, [globalMaint]);

  // 3. 🚨 Infrastructure Alert Monitor (Real-time)
  const { data: appsStatus = [] } = useQuery({
    queryKey: ['globalAppsStatus'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/managedapps');
      return res.data.data || [];
    },
    refetchInterval: 30000, // Background check every 30s
  });

  const [isAlertDismissed, setIsAlertDismissed] = useState(false);
  const downApps = appsStatus.filter(app => app.status === 'down' && !app.inMaintenance);

  // Auto-show alert if new down apps appear
  useEffect(() => {
    if (downApps.length > 0) setIsAlertDismissed(false);
  }, [downApps.length]);

  // 4. 🚧 Toggle Global Maintenance Mutation
  const toggleMaintMutation = useMutation({
    mutationFn: async (newValue) => {
      const res = await axios.patch('/api/admin/dashboard/config/maintenance', { value: newValue });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalMaintenance'] });
    },
    onError: (err) => {
      console.error("Failed to toggle maintenance:", err);
      // Revert local state on error
      setIsMaintActive(globalMaint);
    }
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  const handleLogout = async () => {
    try {
      await axios.post('/api/admin/auth/logout');
      router.push('/'); 
      router.refresh();
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleMaintToggle = (e) => {
    const val = e.target.checked;
    setIsMaintActive(val); // Instant UI Feedback
    toggleMaintMutation.mutate(val);
  };

  return (
    <div className={styles.layoutRoot}>
      
      {/* 1. PREMIUM HEADER */}
      <header className={styles.header}>
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

      {/* 2. MODULAR SIDEBAR */}
      <Sidebar 
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        isMaintActive={isMaintActive}
        handleMaintToggle={handleMaintToggle}
        isMaintLoading={isMaintLoading}
        isToggling={toggleMaintMutation.isPending}
        handleLogout={handleLogout}
      />

      <main className={styles.mainContent}>
        <InfraAlert downApps={downApps} />
        {children}
      </main>

    </div>
  );
}
