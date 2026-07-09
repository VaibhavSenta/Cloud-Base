'use client';

import React, { useCallback, useMemo } from 'react';
import styles from './dashboard.module.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Switch from '@/components/admin/Switch/Switch';
import Skeleton from '@/components/admin/Skeleton/Skeleton';
import ErrorBoundary from '@/components/admin/ErrorBoundary/ErrorBoundary';
import StatCard from '@/features/dashboard/StatCard/StatCard';
import ServiceCard from '@/features/dashboard/ServiceCard/ServiceCard';
import { useMutation } from '@tanstack/react-query';
import { useSecureQuery, useSecureQueryClient } from 'secure-query-cache';
import axios from 'axios';

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useSecureQueryClient();

  const { data: apps = [], isLoading: isAppsLoading, error: appsError } = useSecureQuery({
    queryKey: ['appsList'],
    queryFn: async () => {
      const res = await axios.get(`/api/admin/managedapps?v=${Date.now()}`);
      return res.data.data || [];
    },
  });

  // 📊 Fetch Deep Analytics (User Growth, etc.)
  const { data: analytics } = useSecureQuery({
    queryKey: ['systemAnalytics'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/dashboard/analytics/summary');
      return res.data.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes cache
  });

  const toggleMaintMutation = useMutation({
    mutationFn: async (appId) => {
      const res = await axios.patch(`/api/admin/managedapps/toggle-maintenance/${appId}`);
      return res.data;
    },
    // Optimistic Update: instant UI feedback
    onMutate: async (appId) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['appsList'] });
      // Snapshot previous value for rollback
      const previousApps = queryClient.getQueryData(['appsList']);
      // Optimistically update the cache
      queryClient.setQueryData(['appsList'], (old) =>
        old?.map(app =>
          app._id === appId ? { ...app, inMaintenance: !app.inMaintenance } : app
        )
      );
      return { previousApps };
    },
    onError: (_err, _appId, context) => {
      // Rollback to snapshot on failure
      if (context?.previousApps) {
        queryClient.setQueryData(['appsList'], context.previousApps);
      }
    },
    onSettled: () => {
      // Always refetch to sync with server truth
      queryClient.invalidateQueries({ queryKey: ['appsList'] });
    },
  });

  const metrics = useMemo(() => {
    if (!apps || apps.length === 0) return { totalUsers: 0, healthScore: 100, avgLatency: '0ms', growth: '0%' };

    const totalUsers = apps.reduce((acc, app) => acc + (parseInt(app.actives) || 0), 0);
    
    const optimalApps = apps.filter(app => app.status === 'optimal').length;
    const healthScore = ((optimalApps / apps.length) * 100).toFixed(1);

    const latencies = apps.map(app => parseInt(app.latency) || 0).filter(l => l > 0);
    const avgLatency = latencies.length > 0 
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) 
      : 12;

    let growth = "0%";
    if (analytics?.userGrowth && analytics.userGrowth.length > 0) {
      const recentGrowth = analytics.userGrowth.reduce((a, b) => a + b.count, 0);
      growth = `+${recentGrowth}`;
    }

    return { 
      totalUsers: totalUsers > 1000 ? (totalUsers / 1000).toFixed(1) + 'k' : totalUsers, 
      healthScore, 
      avgLatency: `${avgLatency}ms`,
      growth
    };
  }, [apps, analytics]);

  const handleToggleMaintenance = useCallback((id) => {
    toggleMaintMutation.mutate(id);
  }, [toggleMaintMutation]);

  const handleManage = useCallback((name) => {
    router.push(`/apps/${name}`);
  }, [router]);

  return (
    <div className={styles.dashboardWrapper}>
        
        {/* QUICK ACTIONS FOR MOBILE - Hidden on Desktop */}
        <div className={styles.mobileQuickActions}>
          <div className={styles.quickActionCard}>
            <div className={styles.quickActionHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Image src="/admin-images/lock.png" width={16} height={16} alt="Security" style={{ filter: 'brightness(0) invert(1)' }} />
                <h3>Global Maintenance</h3>
              </div>
              {/* This toggle state should be managed. For now, it links to settings or triggers global logic */}
              <button 
                className={styles.quickActionBtn}
                onClick={() => router.push('/dashboard/settings')}
              >
                Manage
              </button>
            </div>
            <p>Restrict access to all ecosystem apps immediately.</p>
          </div>

          <div className={styles.quickActionCard} onClick={() => router.push('/logs')} style={{ cursor: 'pointer' }}>
            <div className={styles.quickActionHeader}>
               <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Image src="/admin-images/history.png" width={16} height={16} alt="Logs" style={{ filter: 'brightness(0) invert(1)' }} />
                <h3>System Audit Logs</h3>
              </div>
              <span className={styles.arrowIcon}>→</span>
            </div>
            <p>Review real-time security events and admin actions.</p>
          </div>
        </div>

        {/* SECTION 1: INFRASTRUCTURE METRICS ENGINE */}
        <ErrorBoundary section="Infrastructure Health">
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <h2>Infrastructure Health</h2>
            <span className={styles.sectionSub}>Cluster: v4.2.0-stable</span>
          </div>

          <div className={styles.gridStats}>
            
            <StatCard 
              icon="/admin-images/group.png"
              value={metrics.totalUsers}
              label="Live Ecosystem Traffic"
              badgeText={metrics.growth !== "0%" ? `${metrics.growth} new` : "Real-time"}
              badgeStyle={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
              iconStyle={{ backgroundColor: 'rgba(5, 102, 217, 0.1)', iconColor: 'var(--primary)' }}
            />

            <StatCard 
              icon="/admin-images/health-and-safty.png"
              value={`${metrics.healthScore}%`}
              label="Infrastructure Stability"
              badgeText={metrics.healthScore > 90 ? "Optimal" : "Check Nodes"}
              badgeStyle={{ 
                color: metrics.healthScore > 90 ? '#10b981' : '#f59e0b', 
                background: metrics.healthScore > 90 ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)' 
              }}
              iconStyle={{ backgroundColor: 'rgba(173, 198, 255, 0.1)', iconColor: '#adc6ff' }}
            />

            <StatCard 
              icon="/admin-images/speed.png"
              value={metrics.avgLatency}
              label="Avg. Response Latency"
              badgeText="Fast"
              badgeStyle={{ color: '#ffb4ab', background: 'rgba(255,180,171,0.05)' }}
              iconStyle={{ backgroundColor: 'rgba(255, 180, 171, 0.1)', iconColor: '#ffb4ab' }}
            />

          </div>
        </section>
        </ErrorBoundary>

        {/* SECTION 2: INSIGHTS ENGINE */}
        {analytics?.userGrowth?.length > 0 && (
          <section className={styles.sectionBlock} style={{ marginTop: '0' }}>
             <div className={styles.insightBanner}>
                <div className={styles.insightIcon}>🚀</div>
                <div className={styles.insightText}>
                   <strong>Growth Insight:</strong> You gained {analytics.userGrowth.reduce((a, b) => a + b.count, 0)} new users in the last 7 days. Ecosystem expansion is on track.
                </div>
             </div>
          </section>
        )}

        {/* SECTION 3: RECTIFIED SERVICE HUB CONTROLS */}
        <ErrorBoundary section="Service Hub">
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2>Service Hub</h2>
              <span className={styles.serviceHubBadge}>
                {isAppsLoading ? <Skeleton width="80px" height="12px" /> : `${apps.length} Subdomains Managed`}
              </span>
            </div>
          </div>

          <div className={styles.gridServices}>
            {isAppsLoading ? 
              Array(4).fill(0).map((_, i) => (
                <div key={i} className={styles.serviceCard} style={{ opacity: 0.7 }}>
                  <div className={styles.serviceTop}>
                    <Skeleton width="40px" height="40px" borderRadius="10px" />
                    <Skeleton width="44px" height="22px" borderRadius="34px" />
                  </div>
                  <div className={styles.serviceInfo} style={{ marginTop: '16px' }}>
                    <Skeleton width="60%" height="20px" />
                    <Skeleton width="40%" height="14px" style={{ marginTop: '8px' }} />
                  </div>
                  <div className={styles.serviceStats} style={{ marginTop: '16px' }}>
                    <Skeleton width="50px" height="20px" />
                    <Skeleton width="80px" height="20px" />
                  </div>
                  <Skeleton width="100%" height="40px" style={{ marginTop: '20px' }} />
                </div>
              ))
             : appsError ? (
                <div style={{ color: '#ef4444', padding: '20px', gridColumn: '1/-1' }}>
                  ❌ Backend Error: Unable to sync with Managed Nodes.
                </div>
              ) :
              apps.map((details) => (
                <ServiceCard 
                  key={details._id}
                  details={details}
                  onToggleMaintenance={handleToggleMaintenance}
                  onManage={handleManage}
                  isToggling={toggleMaintMutation.isPending}
                />
              ))
            }
          </div>
        </section>
        </ErrorBoundary>

      </div>
  );
}
