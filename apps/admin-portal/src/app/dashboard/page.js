'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import styles from './dashboard.module.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Switch from '@/components/admin/Switch/Switch';
import Skeleton from '@/components/admin/Skeleton/Skeleton';
import StatCard from '@/components/admin/StatCard/StatCard';
import ServiceCard from '@/components/admin/ServiceCard/ServiceCard';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: apps = [], isLoading: isAppsLoading, error: appsError } = useQuery({
    queryKey: ['appsList'],
    queryFn: async () => {
      const res = await axios.get(`/api/admin/managedapps?v=${Date.now()}`);
      return res.data.data || [];
    },
  });

  // 📊 Fetch Deep Analytics (User Growth, etc.)
  const { data: analytics } = useQuery({
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appsList'] });
    },
  });

  // 📈 Real-time Analytics Calculations
  const calculateMetrics = () => {
    if (!apps || apps.length === 0) return { totalUsers: 0, healthScore: 100, avgLatency: '0ms', growth: '0%' };

    const totalUsers = apps.reduce((acc, app) => acc + (parseInt(app.actives) || 0), 0);
    
    const optimalApps = apps.filter(app => app.status === 'optimal').length;
    const healthScore = ((optimalApps / apps.length) * 100).toFixed(1);

    const latencies = apps.map(app => parseInt(app.latency) || 0).filter(l => l > 0);
    const avgLatency = latencies.length > 0 
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length) 
      : 12;

    // Calculate growth from analytics data if available
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
  };

  const metrics = calculateMetrics();

  return (
    <AdminLayout>
      <div className={styles.dashboardWrapper}>
        
        {/* SECTION 1: INFRASTRUCTURE METRICS ENGINE */}
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
                  onToggleMaintenance={(id) => toggleMaintMutation.mutate(id)}
                  onManage={(name) => router.push(`/apps/${name}`)}
                  isToggling={toggleMaintMutation.isPending}
                />
              ))
            }
          </div>
        </section>

      </div>
    </AdminLayout>
  );
}
