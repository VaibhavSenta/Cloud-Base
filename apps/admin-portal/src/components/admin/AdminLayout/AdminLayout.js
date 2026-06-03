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

  // 3. 🚨 Infrastructure Alert Monitor (Real-time)
  const { data: appsStatus = [] } = useQuery({
    queryKey: ['globalAppsStatus'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/managedapps');
      return res.data.data || [];
    },
    refetchInterval: 30000, // Background check every 30s
  });

  const downApps = appsStatus.filter(app => app.status === 'down' && !app.inMaintenance);

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
        <div className={styles.headerWraper}>
          
          <div className={styles.headerLeft}>
            <span className={`material-symbols-outlined ${styles.mobileMenuBtn}`} onClick={toggleSidebar}>
              {isSidebarOpen ? 'close' : '|||'}
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
            

            <div className={styles.userSection}>
              <button className={styles.notifBtn}>
                <Image src="/admin-images/notification-bell.png" width={20} height={20} alt='Notifications' />
                <span className={styles.notifDot}></span>
              </button>
              <span className={styles.userName}>{admin?.firstname || 'Admin'}</span>
              <div className={styles.userAvatar} onMouseEnter={()=> router.prefetch('/profile')} onClick={()=> router.push('/profile')}>
                <img alt="Admin Profile" src="/admin-icon.png" property='true'  />
              </div>
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
          <div className={styles.nodeBadge}>
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
          </div>
        </div>

        <nav className={styles.navList}>
          <Link 
            href="/dashboard" 
            className={`${styles.navItem} ${pathname === '/dashboard' ? styles.active : ''}`} 
            onClick={closeSidebar}
            onMouseEnter={() => router.prefetch('/dashboard')}
          >
            <span>Dashboard</span>
          </Link>
          <Link 
            href="/apps" 
            className={`${styles.navItem} ${pathname === '/apps' ? styles.active : ''}`} 
            onClick={closeSidebar}
            onMouseEnter={() => router.prefetch('/apps')}
          >
            <span>Apps</span>
          </Link>
          <Link 
            href="/dashboard/users" 
            className={`${styles.navItem} ${pathname === '/dashboard/users' ? styles.active : ''}`} 
            onClick={closeSidebar}
            onMouseEnter={() => router.prefetch('/dashboard/users')}
          >
            <span>Users</span>
          </Link>
          <Link 
            href="/logs" 
            className={`${styles.navItem} ${pathname === '/logs' ? styles.active : ''}`} 
            onClick={closeSidebar}
            onMouseEnter={() => router.prefetch('/logs')}
          >
            <span>Logs</span>
          </Link>
        </nav>

        <div className={styles.bottomNav}>
          <div className={styles.navList}>
            <Link 
              href="/dashboard/settings" 
              className={`${styles.navItem} ${pathname === '/dashboard/settings' ? styles.active : ''}`} 
              onClick={closeSidebar}
              onMouseEnter={() => router.prefetch('/dashboard/settings')}
            >
              <span>Settings</span>
            </Link>
            <Link 
              href="/profile" 
              className={`${styles.navItem} ${pathname === '/profile' ? styles.active : ''}`} 
              onClick={closeSidebar}
              onMouseEnter={() => router.prefetch('/profile')}
            >
              <span>Profile</span>
            </Link>
          </div>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            <span className="material-symbols-outlined">{"\>"}</span>
            <span>Logout Console</span>
          </button>
        </div>
      </aside>

      <main className={styles.mainContent}>
        {downApps.length > 0 && (
          <div className={styles.globalAlert}>
            <span className="material-symbols-outlined">warning</span>
            <div className={styles.alertContent}>
              <p><strong>Infrastructure Alert:</strong> {downApps.length} system(s) are currently unreachable.</p>
              <div className={styles.downList}>
                {downApps.map(app => (
                  <span key={app._id} className={styles.downBadge}>{app.title}</span>
                ))}
              </div>
            </div>
            <button onClick={() => router.push('/apps')} className={styles.viewAppsBtn}>Resolve Now</button>
          </div>
        )}
        {children}
      </main>

    </div>
  );
}
