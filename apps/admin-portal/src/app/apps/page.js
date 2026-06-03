'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import styles from './apps.module.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import AddAppModal from '@/components/admin/apps/AddAppModal';

export default function AppsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [envFilter, setEnvFilter] = React.useState('all');

  const { data: apps = [], isLoading, error, refetch } = useQuery({
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

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         app.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEnv = envFilter === 'all' || app.environment === envFilter;
    return matchesSearch && matchesEnv;
  });

  const toggleMaintMutation = useMutation({
    mutationFn: async (appId) => {
      const res = await axios.patch(`/api/admin/managedapps/toggle-maintenance/${appId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appsList'] });
    },
  });

  return (
    <AdminLayout>
      <div className={styles.appsWrapper}>
        
        <header className={styles.appsHeader}>
          <div className={styles.headerTitle}>
            <h1>Managed Ecosystem</h1>
            <p>Monitor and control all CloudBase integrated applications</p>
          </div>
          <button className={styles.addAppBtn} onClick={() => setIsModalOpen(true)}>
            <div className={styles.btnIcon}>
              <Image src={'/admin-images/add-link.png'} width={20} height={20} alt="" />
            </div>
            <span>Register New App</span>
          </button>
        </header>

        {/* Global Metrics Bar */}
        <section className={styles.globalStats}>
          <div className={styles.statMiniCard}>
            <span className={styles.statLabel}>Total Apps</span>
            <span className={styles.statValue}>{apps.length}</span>
          </div>
          <div className={styles.statMiniCard}>
            <span className={styles.statLabel}>System Health</span>
            <span className={styles.statValue} style={{ color: healthColor }}>{globalHealth}%</span>
          </div>
          <div className={styles.statMiniCard}>
            <span className={styles.statLabel}>Active Traffic</span>
            <span className={styles.statValue}>
              {apps.reduce((acc, app) => acc + (parseInt(app.actives) || 0), 0)}
            </span>
          </div>
        </section>

        {/* Advanced Filters */}
        <section className={styles.filterSection}>
          <div className={styles.searchBox}>
            <span className="material-symbols-outlined">search</span>
            <input 
              type="text" 
              placeholder="Search apps by title or slug..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className={styles.envFilters}>
            {['all', 'production', 'staging', 'development'].map((env) => (
              <button 
                key={env}
                className={`${styles.filterChip} ${envFilter === env ? styles.activeChip : ''}`}
                onClick={() => setEnvFilter(env)}
              >
                {env.charAt(0).toUpperCase() + env.slice(1)}
              </button>
            ))}
          </div>
        </section>

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
              <div key={app._id} className={`${styles.appCard} ${app.inMaintenance ? styles.maintMode : ''}`}>
                <div className={styles.cardHeader}>
                  <div className={styles.appIcon}>
                        {app.icon?.startsWith('/') || app.icon?.startsWith('http') ? (
                           <Image fill src={app.icon} alt={app.title} sizes="56px" style={{ objectFit: 'contain', padding: '10px' }} />
                        ) : (
                           <span className="material-symbols-outlined">{app.icon || 'apps'}</span>
                        )}
                  </div>
                  <div className={styles.statusBadge}>
                    <div className={`${styles.statusDot} ${styles[app.status || 'optimal']}`}></div>
                    <span>{app.status || 'Optimal'}</span>
                  </div>
                </div>

                <div className={styles.appInfo}>
                  <h3>{app.title}</h3>
                  <p className={styles.appUrl}>{app.userUrl}</p>
                </div>

                <div className={styles.appMetrics}>
                  <div className={styles.metricItem}>
                    <span className={styles.metricValue}>{app.actives}</span>
                    <span className={styles.metricLabel}>Users</span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricValue}>{app.latency || '12ms'}</span>
                    <span className={styles.metricLabel}>Latency</span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricValue}>{app.version}</span>
                    <span className={styles.metricLabel}>Version</span>
                  </div>
                </div>

                <div className={styles.cardActions}>
                  <div className={styles.toggleSection}>
                    <span>Maint. Mode</span>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox"
                        checked={app.inMaintenance || false} 
                        onChange={() => toggleMaintMutation.mutate(app._id)}
                        disabled={toggleMaintMutation.isPending}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                  
                  <div className={styles.btnGroup}>
                    <button 
                      onClick={() => router.push(`/apps/${app.name}`)}
                      className={styles.actionBtn}
                    >
                      Overview
                    </button>
                    <button 
                      onClick={() => router.push(`/apps/${app.name}/dashboard`)}
                      className={`${styles.actionBtn} ${styles.primaryBtn}`}
                    >
                      Dashboard
                    </button>
                  </div>
                </div>
              </div>
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
    </AdminLayout>
  );
}
