'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useSecureQuery, useSecureQueryClient } from 'secure-query-cache';
import axios from 'axios';
import Mobile from './Mobile/Mobile';
import Desktop from './Desktop/Desktop';

/**
 * AdminLayout Wrapper Component
 * Manages core queries (admin profile, maintenance, latency alert nodes)
 * and feeds layout-specific templates depending on screen sizes.
 */
export default function AdminLayout({ children }) {
  const router = useRouter();
  const queryClient = useSecureQueryClient();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMaintActive, setIsMaintActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // 1. Fetch Admin Profile
  const { data: admin } = useSecureQuery({
    queryKey: ['adminProfile'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/profile');
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000, 
  });

  // 2. 🚧 Fetch Global Maintenance State
  const { data: globalMaint } = useSecureQuery({
    queryKey: ['globalMaintenance'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/dashboard/config/maintenance');
      return res.data.value;
    }
  });

  useEffect(() => {
    if (globalMaint !== undefined) {
      setIsMaintActive(globalMaint);
    }
  }, [globalMaint]);

  // 3. 🚨 Infrastructure Alert Monitor (Real-time)
  const { data: appsStatus = [] } = useSecureQuery({
    queryKey: ['globalAppsStatus'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/managedapps');
      return res.data.data || [];
    },
    refetchInterval: 30000, // Background check every 30s
  });

  const downApps = appsStatus.filter(app => app.status === 'down' && !app.inMaintenance);

  // App Badging API (PWA Feature)
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

  // 4. 🚧 Toggle Global Maintenance Mutation
  const toggleMaintMutation = useMutation({
    mutationFn: async (newValue) => {
      const res = await axios.patch('/api/admin/dashboard/config/maintenance', { value: newValue });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalMaintenance'] });
    },
    onError: () => {
      // Revert state on error
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
    setIsMaintActive(val);
    toggleMaintMutation.mutate(val);
  };

  const isSubPage = pathname.slice(1).startsWith('dashboard/settings/') || pathname.startsWith('/apps/');
  
  let pageTitle = 'Settings';
  if (pathname.startsWith('/apps/')) pageTitle = 'App Details';
  if (pathname === '/dashboard/settings/security-privacy') pageTitle = 'Security & Privacy';
  if (pathname === '/dashboard/settings/system-preferences') pageTitle = 'System Preferences';
  if (pathname === '/dashboard/settings/data-management') pageTitle = 'Data Management';

  const commonProps = {
    children,
    pathname,
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    isMaintActive,
    handleMaintToggle,
    isMaintLoading: toggleMaintMutation.isPending,
    handleLogout,
    admin,
    downApps,
    isSubPage,
    pageTitle
  };

  // Do not render panels or layouts on the login gate page
  if (pathname === '/') {
    return <>{children}</>;
  }

  if (isMobile) {
    return <Mobile {...commonProps} />;
  }

  return <Desktop {...commonProps} />;
}
