'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import styles from './dashboard.module.css';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: apps = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['appsList'],
    queryFn: async () => {
      // 🎯 Cache busting parameter taaki browser purana empty response na pakde
      const res = await axios.get(`/api/admin/managedapps?v=${Date.now()}`);
      if (res.status !== 200) {
        throw new Error("Error getting app list..");
      }
      return res.data.data || []; // Ensure it's at least an empty array
    },
    refetchOnWindowFocus: true,
  });

  // 🎯 FORCE SYNC: Jab bhi page pe wapis aaye, ek baar zor se fetch karo
  React.useEffect(() => {
    refetch();
  }, [refetch]);

  // 2. TOGGLE MAINTENANCE MUTATION
  const toggleMaintMutation = useMutation({
    mutationFn: async (appId) => {
      const res = await axios.patch(`/api/admin/managedapps/toggle-maintenance/${appId}`);
      return res.data;
    },
    onSuccess: () => {
      // Invalidate cache to force a fresh fetch instantly
      queryClient.invalidateQueries({ queryKey: ['appsList'] });
    },
  });

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
            {/* Active Nodes Card */}
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

            {/* RPS Analytics Card */}
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

            {/* Cluster Resource Card */}
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

        {/* SECTION 2: SYSTEM CRITICAL ALERT BOUNDARY */}
        <section className={styles.sectionBlock}>
          <div className={styles.alertBanner}>
            <div className={styles.shimmer}></div>
            <div className={styles.alertIconBox}>
              <span className="material-symbols-outlined">warning</span>
            </div>
            <div className={styles.alertContent}>
              <h4 className={styles.alertTitle}>Cross-App Critical Alert</h4>
              <p className={styles.alertText}>
                Latency spikes detected in <strong>chat.cloudbase.com</strong> affecting downstream notification delivery.
              </p>
            </div>
            <button className={styles.alertBtn}>Acknowledge</button>
          </div>
        </section>

        {/* SECTION 3: RECTIFIED SERVICE HUB CONTROLS */}
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2>Service Hub</h2>
              <span style={{ fontSize: '11px', fontWeight: '600', padding: '4px 12px', background: '#323537', borderRadius: '999px', color: '#bcc9cd', textTransform: 'uppercase' }}>
                4 Subdomains Managed
              </span>
            </div>
          </div>

          <div className={styles.gridServices}>
            {isLoading ? 
              <div style={{ color: '#bcc9cd' }}>Loading Data ...</div>
             : error ? (
                /* 🎯 Agar backend se 401 ya koi error aaya toh ye dikhega */
                <div style={{ color: 'var(--error)', padding: '20px', gridColumn: '1/-1' }}>
                  ❌ Backend Error: {error.response?.data?.msg || error.message}
                  <br />
                  <button onClick={() => refetch()} className={styles.manageBtn} style={{ width: 'auto', marginTop: '12px', padding: '6px 16px' }}>
                    Retry Fetch
                  </button>
                </div>
                
              ) :

              apps.map((details, index) => (
                <div key={index} className={details.inMaintenance ? styles.serviceCardMaintMode : styles.serviceCard}>
                  <div className={styles.serviceTop}>
                    <div className={styles.serviceIcon}>
                      <span className="material-symbols-outlined">{details.icon || 'apps'}</span>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox"
                        checked={details.inMaintenance || false} 
                        onChange={() => toggleMaintMutation.mutate(details._id)} // Fixed: Triggers mutation with DB id
                        disabled={toggleMaintMutation.isPending} // Spam protection
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
                  <button onClick={() => router.push(`/${details.name}`)} className={styles.manageBtn}>Manage Hub</button>
                </div>
              ))

            }
          </div>
        </section>

        {/* SECTION 4: DEPLOYMENT LOGSTREAM DATA MATRIX */}
        <section className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <h2 style={{ fontSize: '24px' }}>Recent Deployment Logs</h2>
          </div>
          
          <div className={styles.tableOuterWrapper}>
            <div className={styles.tableContainer}>
              <table className={styles.tableElement}>
                <thead>
                  <tr>
                    <th>Service</th>
                    <th>Update Description</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ color: '#e0e3e5', fontWeight: '500' }}>Chat Engine</td>
                    <td>System updated to v2.1 (Performance patches)</td>
                    <td><span className={`${styles.statusPill} ${styles.pillSuccess}`}>SUCCESS</span></td>
                    <td>12 mins ago</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#e0e3e5', fontWeight: '500' }}>Account Hub</td>
                    <td>Database migration for user sessions</td>
                    <td><span className={`${styles.statusPill} ${styles.pillSuccess}`}>SUCCESS</span></td>
                    <td>4 hours ago</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#e0e3e5', fontWeight: '500' }}>Game Servers</td>
                    <td>Region scaling US-WEST-2 expansion</td>
                    <td><span className={`${styles.statusPill} ${styles.pillProgress}`}>IN PROGRESS</span></td>
                    <td>24 mins ago</td>
                  </tr>
                  <tr>
                    <td style={{ color: '#e0e3e5', fontWeight: '500' }}>Knowledge Base</td>
                    <td>Asset CDN cache invalidation</td>
                    <td><span className={`${styles.statusPill} ${styles.pillSuccess}`}>SUCCESS</span></td>
                    <td>Yesterday</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

      </div>
    </AdminLayout>
  );
}