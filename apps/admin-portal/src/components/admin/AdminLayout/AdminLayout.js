'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import styles from './AdminLayout.module.css';

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

  // 3. 🚧 Toggle Global Maintenance Mutation
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
      alert("System Error: Failed to toggle maintenance mode.");
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
        <div className={styles.headerLeft}>
          <span className={`material-symbols-outlined ${styles.mobileMenuBtn}`} onClick={toggleSidebar}>
            {isSidebarOpen ? 'close' : 'menu'}
          </span>
          <h1 className={styles.logoText}>Cloud Base</h1>
          
          <div className={styles.networkStatus}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div className={styles.statusDot}></div>
              <span className={styles.statusText}>Global Network: Optimal</span>
            </div>
            <div className={styles.statusDivider}></div>
            <span className={styles.latencyText}>Latency: 12ms</span>
          </div>
        </div>

        <div className={styles.headerRight}>
          {/* Global Maintenance Switch */}
          <div className={styles.maintModeHeader} style={{ display: 'flex' }}>
            <span className={styles.maintLabel}>Global Maint. Mode</span>
            <label className={styles.switch}>
              <input 
                type="checkbox" 
                checked={isMaintActive} 
                onChange={handleMaintToggle} 
                disabled={isMaintLoading || toggleMaintMutation.isPending}
              />
              <span className={styles.slider}></span>
            </label>
          </div>

          <div className={styles.userSection}>
            <button className={styles.notifBtn}>
              <span className="material-symbols-outlined">notifications</span>
              <span className={styles.notifDot}></span>
            </button>
            <span className={styles.userName}>{admin?.firstname || 'Admin'}</span>
            <div className={styles.userAvatar} onMouseEnter={()=> router.prefetch('/profile')} onClick={()=> router.push('/profile')}>
              <img alt="Admin Profile" src="https://lh3.googleusercontent.com/d/1ThnxTHqvV7Mrf0RtDrfTyt-0uHXPPujl" />
            </div>
          </div>
        </div>
      </header>

      {/* 2. INFRASTRUCTURE SIDEBAR */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarActive : ''}`}>
        <div className={styles.sidebarLogoSection}>
          <div className={styles.logoWrapper}>
            <span className={styles.sidebarLogoText}>Cloud Base</span>
          </div>
          
          <div className={styles.profileSnippet}>
            <div className={styles.profileIconBox}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>@</span>
            </div>
            <div className={styles.profileInfo}>
              <p className={styles.adminLabel}>System Admin</p>
              <p className={styles.accessLabel}>Root Access</p>
            </div>
          </div>
          <div className={styles.nodeBadge}>Node: US-EAST-1</div>
        </div>

        <nav className={styles.navList}>
          <Link href="/dashboard" className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`} onClick={closeSidebar}>
            <span>Dashboard</span>
          </Link>
          <Link href="/dashboard/apps" className={`${styles.navItem} ${pathname === '/dashboard/items' ? styles.active : ''}`} onClick={closeSidebar}>
            <span>Apps</span>
          </Link>
          <Link href="/dashboard/users" className={`${styles.navItem} ${pathname === '/dashboard/storage' ? styles.active : ''}`} onClick={closeSidebar}>
            <span>Users</span>
          </Link>
          <Link href="/dashboard/logs" className={`${styles.navItem} ${pathname === '/dashboard/logs' ? styles.active : ''}`} onClick={closeSidebar}>
            <span>Logs</span>
          </Link>
        </nav>

        <div className={styles.bottomNav}>
          <div className={styles.navList}>
            <Link href="/dashboard/settings" className={`${styles.navItem} ${pathname === '/dashboard/settings' ? styles.active : ''}`} onClick={closeSidebar}>
              <span>Settings</span>
            </Link>
            <Link href="/profile" className={`${styles.navItem} ${pathname === '/profile' ? styles.active : ''}`} onClick={closeSidebar}>
              <span>Profile</span>
            </Link>
          </div>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span className="material-symbols-outlined">logout</span>
            <span>Logout Console</span>
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        {children}
      </main>

    </div>
  );
}
