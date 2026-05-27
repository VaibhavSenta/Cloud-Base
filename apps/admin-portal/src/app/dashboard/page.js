'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import styles from './dashboard.module.css';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
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

  // 1. Fetch Real-time Analytics from Backend
  const { data: analytics, isLoading: isAnalLoading, error: analError } = useQuery({
    queryKey: ['systemAnalytics'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/dashboard/analytics/summary');
      return res.data.data;
    },
    refetchInterval: 60000, // Sync every minute
  });

  // Dynamic calculations or fallback to defaults
  const userGrowth = analytics?.userGrowth?.map(d => d.count) || [0, 0, 0, 0, 0, 0, 0];
  const totalActives = analytics?.totalActives || 0;
  const appsSummary = analytics?.appsSummary || [];

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
      <div className={styles.dashboardWrapper}>
        
        {/* TOP ANALYTICS WIDGETS */}
        <section className={styles.analyticsSection}>
          {/* Widget 1: User Growth Trend */}
          <div className={styles.analyticsCard}>
            <div className={styles.cardHeader}>
              <h3>User Growth (7 Days)</h3>
              <span className={styles.trendUp}>+24%</span>
            </div>
            <div className={styles.chartArea}>
              <svg viewBox="0 0 400 100" className={styles.growthChart}>
                <polyline
                  fill="none"
                  stroke="#4cd7f6"
                  strokeWidth="3"
                  points={userGrowth.map((v, i) => `${(i * 400) / 6},${100 - (v * 100) / 50}`).join(' ')}
                />
                {userGrowth.map((v, i) => (
                  <circle key={i} cx={(i * 400) / 6} cy={100 - (v * 100) / 50} r="4" fill="#4cd7f6" />
                ))}
              </svg>
              <div className={styles.chartLabels}>
                <span>Day 1</span>
                <span>Today</span>
              </div>
            </div>
          </div>

          {/* Widget 2: App Traffic Heatmap */}
          <div className={styles.analyticsCard}>
            <div className={styles.cardHeader}>
              <h3>Traffic Distribution</h3>
              <span className={styles.totalStats}>{totalActives} Total Active</span>
            </div>
            <div className={styles.heatmapList}>
              {appsSummary.map((app, i) => {
                const percentage = (parseInt(app.actives) / (totalActives || 1)) * 100;
                return (
                  <div key={app._id} className={styles.heatmapItem}>
                    <div className={styles.heatInfo}>
                      <span>{app.title}</span>
                      <span>{app.actives} users</span>
                    </div>
                    <div className={styles.heatBar}>
                      <div className={styles.heatFill} style={{ width: `${percentage}%` }}></div>
                    </div>
                  </div>
                );
              })}
              {appsSummary.length === 0 && !isAnalLoading && <p className={styles.emptyText}>No service data available.</p>}
            </div>
          </div>
        </section>

        {/* SECTION 1: INFRASTRUCTURE METRICS ENGINE */}
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <h2>Infrastructure Health</h2>
            <span className={styles.sectionSub}>Cluster: v4.2.0-stable</span>
          </div>

          <div className={styles.gridStats}>
            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIcon} style={{ backgroundColor: 'rgba(76, 215, 246, 0.1)' }}>
                  <span className="material-symbols-outlined" style={{ color: '#4cd7f6' }}>storage</span>
                </div>
                <span className={styles.statBadge} style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>Stable</span>
              </div>
              <div>
                <p className={styles.statValue}>12</p>
                <p className={styles.statLabel}>Active Cloud Nodes</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIcon} style={{ backgroundColor: 'rgba(173, 198, 255, 0.1)' }}>
                  <span className="material-symbols-outlined" style={{ color: '#adc6ff' }}>query_stats</span>
                </div>
                <span className={styles.statBadge} style={{ color: '#4cd7f6', background: 'rgba(76,215,246,0.05)' }}>+12.4%</span>
              </div>
              <div>
                <p className={styles.statValue}>4.8k</p>
                <p className={styles.statLabel}>Requests Per Second</p>
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statTop}>
                <div className={styles.statIcon} style={{ backgroundColor: 'rgba(255, 180, 171, 0.1)' }}>
                  <span className="material-symbols-outlined" style={{ color: '#ffb4ab' }}>memory</span>
                </div>
                <span className={styles.statBadge} style={{ color: '#ffb4ab', background: 'rgba(255,180,171,0.05)' }}>High Load</span>
              </div>
              <div>
                <p className={styles.statValue}>84%</p>
                <p className={styles.statLabel}>Cluster Resource Utilization</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: RECTIFIED SERVICE HUB CONTROLS */}
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2>Service Hub</h2>
              <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 12px', background: '#323537', borderRadius: '999px', color: '#bcc9cd', textTransform: 'uppercase' }}>
                {apps.length} Subdomains Managed
              </span>
            </div>
          </div>

          <div className={styles.gridServices}>
            {isAppsLoading ? 
              <div style={{ color: '#bcc9cd' }}>Syncing Systems ...</div>
             : appsError ? (
                <div style={{ color: '#ef4444', padding: '20px', gridColumn: '1/-1' }}>
                  ❌ Backend Error: Unable to sync with Managed Nodes.
                </div>
              ) :
              apps.map((details) => (
                <div key={details._id} className={details.inMaintenance ? styles.serviceCardMaintMode : styles.serviceCard}>
                  <div className={styles.serviceTop}>
                    <div className={styles.serviceIcon}>
                       {details.icon?.startsWith('/') || details.icon?.startsWith('http') ? (
                          <Image src={details.icon} width={28} height={28} alt="" />
                       ) : (
                          <span className="material-symbols-outlined">{details.icon || 'apps'}</span>
                       )}
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox"
                        checked={details.inMaintenance || false} 
                        onChange={() => toggleMaintMutation.mutate(details._id)}
                        disabled={toggleMaintMutation.isPending}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                  <div className={styles.serviceInfo}>
                    <h3>{details.title}</h3>
                    <p className={styles.serviceDomain}>{details.userUrl}</p>
                  </div>
                  <div className={styles.serviceStats}>
                    {details.traffic === "High" ? (
                      <span className={styles.trafficBadgeWarning}>{details.traffic}</span>
                    ) : (
                      <span className={styles.trafficBadge}>{details.traffic}</span>
                    )}
                    <span className={styles.activeCount}>{details.actives} active</span>
                  </div>
                  <button onClick={() => router.push(`/apps/${details.name}`)} className={styles.manageBtn}>Manage Hub</button>
                </div>
              ))
            }
          </div>
        </section>

      </div>
    </AdminLayout>
  );
}
