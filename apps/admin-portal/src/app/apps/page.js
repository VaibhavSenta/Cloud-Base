/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import React from 'react';
import styles from './apps.module.css';
import { useRouter } from 'next/navigation';
import NextImage from 'next/image';
import { useMutation } from '@tanstack/react-query';
import { useSecureQuery, useSecureQueryClient } from 'secure-query-cache';
import axios from 'axios';
import dynamic from 'next/dynamic';
import useDebounce from '@/hooks/useDebounce';
import StatCard from '@/features/dashboard/StatCard/StatCard';
import AppCard from '@/features/apps-management/AppCard/AppCard';
import AppFilters from '@/features/apps-management/AppFilters/AppFilters';

const AddAppModal = dynamic(() => import('@/features/apps-management/Modals/AddAppModal'), { ssr: false });

export default function AppsPage() {
  const router = useRouter();
  const queryClient = useSecureQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [envFilter, setEnvFilter] = React.useState('all');

  const { data: apps = [], isLoading, error, refetch } = useSecureQuery({
    queryKey: ['appsList'],
    queryFn: async () => {
      const res = await axios.get(`/api/admin/managedapps?v=${Date.now()}`);
      return res.data.data || [];
    },
    refetchOnWindowFocus: true,
  });

  // --- Dynamic Global Health Calculation ---
  const calculateGlobalHealth = () => {
    if (apps.length === 0) return 100;
    const activeApps = apps.filter(app => !app.inMaintenance);
    if (activeApps.length === 0) return 100;

    const totalPossibleScore = activeApps.length * 100;
    const currentScore = activeApps.reduce((acc, app) => {
      if (app.status === 'optimal') return acc + 100;
      if (app.status === 'degraded') return acc + 50;
      return acc + 0; 
    }, 0);

    return ((currentScore / totalPossibleScore) * 100).toFixed(1);
  };

  const globalHealth = calculateGlobalHealth();
  const healthColor = globalHealth > 90 ? '#10b981' : globalHealth > 70 ? '#f59e0b' : '#ef4444';

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                         app.name.toLowerCase().includes(debouncedSearch.toLowerCase());
    const matchesEnv = envFilter === 'all' || app.environment === envFilter;
    return matchesSearch && matchesEnv;
  });

  const toggleMaintMutation = useMutation({
    mutationFn: async (appId) => {
      const res = await axios.patch(`/api/admin/managedapps/toggle-maintenance/${appId}`);
      return res.data;
    },
    onMutate: async (appId) => {
      await queryClient.cancelQueries({ queryKey: ['appsList'] });
      const previousApps = queryClient.getQueryData(['appsList']);
      queryClient.setQueryData(['appsList'], (old) =>
        old?.map(app =>
          app._id === appId ? { ...app, inMaintenance: !app.inMaintenance } : app
        )
      );
      return { previousApps };
    },
    onError: (_err, _appId, context) => {
      if (context?.previousApps) {
        queryClient.setQueryData(['appsList'], context.previousApps);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['appsList'] });
    },
  });

  return (
    <div className={styles.appsWrapper}>
        
        <header className={styles.appsHeader}>
          <div className={styles.headerTitle}>
            <h1>Managed Ecosystem</h1>
            <p>Monitor and control all CloudBase integrated applications</p>
          </div>
          <button className={styles.addAppBtn} onClick={() => setIsModalOpen(true)}>
            <div className={styles.btnIcon}>
              <NextImage src={'/admin-images/add-link.png'} width={20} height={20} alt="" />
            </div>
            <span className={styles.btnText}>Register New App</span>
          </button>
        </header>

        {/* Global Metrics Bar - Reusing Dashboard StatCards for consistency */}
        <section className={styles.globalStats}>
          <StatCard 
            icon="/admin-images/cloud-node.png"
            value={apps.length}
            label="Total Apps Registered"
            iconStyle={{ backgroundColor: 'rgba(5, 102, 217, 0.1)' }}
          />
          <StatCard 
            icon="/admin-images/systems-ok.png"
            value={`${globalHealth}%`}
            label="Ecosystem Stability"
            badgeText={globalHealth > 90 ? "Stable" : "Critical"}
            badgeStyle={{ 
              color: healthColor, 
              background: `${healthColor}1a` // 10% opacity
            }}
            iconStyle={{ backgroundColor: 'rgba(16, 185, 129, 0.1)' }}
          />
          <StatCard 
            icon="/admin-images/sync.png"
            value={apps.reduce((acc, app) => acc + (parseInt(app.actives) || 0), 0)}
            label="Total Active Traffic"
            iconStyle={{ backgroundColor: 'rgba(255, 180, 171, 0.1)' }}
          />
        </section>

        {/* Advanced Filters */}
        <AppFilters 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          envFilter={envFilter} 
          setEnvFilter={setEnvFilter} 
        />

        {/* Apps Grid */}
        <section className={styles.appsGrid}>
          {isLoading ? (
            <div className={styles.loader}>Initializing Service Mesh...</div>
          ) : error ? (
            <div className={styles.errorMessage}>
              <span className="material-symbols-outlined">error</span>
              <p>Failed to sync with Admin API</p>
              <button onClick={() => refetch()}>Retry Connection</button>
            </div>
          ) : filteredApps.length > 0 ? (
            filteredApps.map((app) => (
              <AppCard 
                key={app._id}
                app={app}
                onToggleMaintenance={(id) => toggleMaintMutation.mutate(id)}
                onOverview={(name) => router.push(`/apps/${name}`)}
                onDashboard={(name) => router.push(`/apps/${name}/dashboard`)}
                isToggling={toggleMaintMutation.isPending}
              />
            ))
          ) : (
             <div className={styles.emptySearch}>
                <span className="material-symbols-outlined">search_off</span>
                <p>No applications match your current filters.</p>
                <button onClick={() => { setSearchTerm(''); setEnvFilter('all'); }}>Clear Filters</button>
             </div>
          )}
        </section>

        {/* Modular Registration Modal */}
        <AddAppModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
        />
      </div>
  );
}
