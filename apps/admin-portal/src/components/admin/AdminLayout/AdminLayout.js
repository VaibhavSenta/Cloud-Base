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
import BottomBar from '../BottomBar/BottomBar';
import Header from '../Header/Header';

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

  // 4. 🎴 App Badging API (PWA Feature)
  useEffect(() => {
    const updateBadge = async () => {
      if ('setAppBadge' in navigator) {
        try {
          if (downApps.length > 0) {
            await navigator.setAppBadge(downApps.length);
          } else {
            await navigator.clearAppBadge();
          }
        } catch (error) {
          console.error('Failed to update app badge:', error);
        }
      }
    };
    updateBadge();
  }, [downApps.length]);

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

  // 5. 📱 Sub-Page Logic (Mobile Specific)
  const isSubPage = pathname.startsWith('/dashboard/settings') || pathname.startsWith('/apps/');
  
  let pageTitle = 'Settings';
  if (pathname.startsWith('/apps/')) pageTitle = 'App Details';
  if (pathname === '/dashboard/settings/security-privacy') pageTitle = 'Security & Privacy';
  if (pathname === '/dashboard/settings/system-preferences') pageTitle = 'System Preferences';
  if (pathname === '/dashboard/settings/data-management') pageTitle = 'Data Management';

  return (
    <div className={styles.layoutRoot}>
      {/* 0. WCO DRAGGABLE AREA */}
      <div className={styles.titleBar}></div>
      
      {/* 1. MODULAR HEADER */}
      <Header 
        isSubPage={isSubPage}
        pageTitle={pageTitle}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        admin={admin}
      />

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

      <main className={`${styles.mainContent} ${isSubPage ? styles.subPageContent : ''}`}>
        <InfraAlert downApps={downApps} />
        {children}
      </main>

      {/* 4. MOBILE BOTTOM NAV (Hidden on sub-pages) */}
      {!isSubPage && <BottomBar />}

    </div>
  );
}
