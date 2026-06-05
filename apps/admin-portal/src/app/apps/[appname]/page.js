'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import styles from './overview.module.css';
import Image from 'next/image';
import EditAppModal from '@/components/admin/apps/EditAppModal';
import InfraManagerModal from '@/components/admin/apps/InfraManagerModal';

export default function AppOverview() {
  const { appname } = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [isInfraModalOpen, setIsInfraModalOpen] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);

  // 1. Fetch Core App Details
  const { data: app, isLoading, error } = useQuery({
    queryKey: ['appDetails', appname],
    queryFn: async () => {
      const res = await axios.get(`/api/admin/managedapps/${appname}`);
      return res.data.data;
    },
    enabled: !!appname
  });

  // 2. Real-time Pulse Engine (Live Health Ping)
  const { data: livePulse, isFetching: isPulsing } = useQuery({
    queryKey: ['appPulse', app?.userUrl],
    queryFn: async () => {
      const url = app.userUrl.startsWith('http') ? app.userUrl : `https://${app.userUrl}`;
      const res = await axios.get(`/api/admin/managedapps/utils/ping?url=${encodeURIComponent(url)}`);
      return res.data;
    },
    enabled: !!app?.userUrl,
    refetchInterval: 30000, 
  });

  // 3. Fetch Audit Logs for this app
  const { data: auditLogs = [] } = useQuery({
    queryKey: ['appLogs', app?._id],
    queryFn: async () => {
      const res = await axios.get(`/api/admin/managedapps/logs/${app._id}`);
      return res.data.data || [];
    },
    enabled: !!app?._id,
  });

  const toggleMaintMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.patch(`/api/admin/managedapps/toggle-maintenance/${app._id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appDetails', appname] });
      queryClient.invalidateQueries({ queryKey: ['appsList'] });
    },
  });

  const deleteAppMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.delete(`/api/admin/managedapps/${app._id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appsList'] });
      router.push('/apps');
    },
  });

  const handleDelete = () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      setTimeout(() => setDeleteConfirm(false), 3000); // Reset after 3s
      return;
    }
    deleteAppMutation.mutate();
  };

  if (isLoading) return <AdminLayout><div className={styles.loading}>Accessing Secure Node...</div></AdminLayout>;
  if (error || !app) return <AdminLayout><div className={styles.error}>Infrastructure Link Failed</div></AdminLayout>;

  const isLocal = app.userUrl.includes('localhost') || app.userUrl.includes('127.0.0.1');
  const isSecure = app.userUrl.startsWith('https');

  return (
    <AdminLayout>
      <div className={styles.overviewWrapper}>
        
        {/* Breadcrumbs & Navigation */}
        <nav className={styles.topNav}>
          <button onClick={() => router.push('/apps')} className={styles.backBtn}>
            <div className={styles.btnIcon}>
               <Image src={'/admin-images/left-arrow.png'} width={24} height={24} alt="" />
            </div>
            <span>Back to Ecosystem</span>
          </button>
          <div className={styles.navActions}>
             <button className={styles.editBtn} onClick={() => setIsEditModalOpen(true)}>
                <div className={styles.btnIcon}>
                  <Image src={'/admin-images/edit-btn.png'} width={18} height={18} alt="Edit" />
                </div>
                <span>Modify Config</span>
             </button>
             <button 
                onClick={() => router.push(`/apps/${appname}/dashboard`)}
                className={styles.dashBtn}
             >
                <div className={styles.btnIcon}>
                  <Image src={'/admin-images/dashboard-icon.png'} width={18} height={18} alt="" />
                </div>
                <span>Open Dashboard</span>
             </button>
          </div>
        </nav>

        {/* Hero Section */}
        <header className={styles.hero}>
          <div className={styles.heroLeft}>
            <div className={styles.iconBox}>
               {app.icon?.startsWith('/') || app.icon?.startsWith('http') ? (
                  <Image src={app.icon} fill alt={app.title} sizes="80px" />
               ) : (
                  <span className="material-symbols-outlined">{app.icon || 'apps'}</span>
               )}
            </div>
            <div className={styles.titleInfo}>
               <h1>{app.title} {isPulsing && <span className={styles.pulseDot}></span>}</h1>
               <div className={styles.badgeRow}>
                  <span className={`${styles.statusBadge} ${styles[livePulse?.status || app.status]}`}>
                     {livePulse?.status || app.status}
                  </span>
                  {(livePulse?.status === 'down' || app.status === 'down') && (
                     <span className={styles.errorText}>
                        {livePulse?.msg || 'Infrastructure Failure'}
                     </span>
                  )}
                  <span className={styles.envBadge}>{app.environment}</span>
                  <span className={styles.versionBadge}>{app.version}</span>
               </div>
            </div>
          </div>
          <div className={styles.heroRight}>
             <div className={styles.maintControl}>
                <span className={styles.statLabel}>Maint. Mode</span>
                <label className={styles.switch}>
                  <input 
                    type="checkbox" 
                    checked={app.inMaintenance || false} 
                    onChange={() => toggleMaintMutation.mutate()} 
                    disabled={toggleMaintMutation.isPending}
                  />
                  <span className={styles.slider}></span>
                </label>
             </div>
             <div className={styles.divider}></div>
             <div className={styles.quickStat}>
                <span className={styles.statVal}>{app.actives}</span>
                <span className={styles.statLabel}>Active Users</span>
             </div>
             <div className={styles.divider}></div>
             <div className={styles.quickStat}>
                <span className={styles.statVal}>{livePulse?.latency || '0ms'}</span>
                <span className={styles.statLabel}>Live Latency</span>
             </div>
          </div>
        </header>

        <div className={styles.contentGrid}>
          {/* Main Info */}
          <section className={styles.detailsCard}>
            <h3>App Configuration</h3>
            <div className={styles.infoGrid}>
               <div className={styles.infoItem}>
                  <label>Internal Name</label>
                  <span>{app.name}</span>
               </div>
               <div className={styles.infoItem}>
                  <label>Service URL</label>
                  <a href={app.userUrl.startsWith('http') ? app.userUrl : `https://${app.userUrl}`} target="_blank" rel="noreferrer">{app.userUrl}</a>
               </div>
               <div className={styles.infoItem}>
                  <label>Infrastructure Port</label>
                  <span>{app.port || 'Auto (Standard)'}</span>
               </div>
               <div className={styles.infoItem}>
                  <label>Established At</label>
                  <span>{new Date(app.establishedAt).toLocaleDateString()}</span>
               </div>
            </div>
            <div className={styles.descriptionSection}>
               <label>Description</label>
               <p>{app.description || 'No description provided for this service.'}</p>
            </div>
          </section>

          {/* Live Monitoring & Node Info */}
          <section className={styles.healthCard}>
            <h3>Live Node Health</h3>
            
            <div className={styles.healthMetric}>
               <div className={styles.metricTop}>
                  <span>Traffic Load</span>
                  <span className={styles.trafficVal}>{app.traffic}</span>
               </div>
               <div className={styles.progressBar}>
                  <div 
                     className={styles.progressFill} 
                     style={{ width: app.traffic === 'High' ? '85%' : '30%', backgroundColor: app.traffic === 'High' ? '#ef4444' : '#10b981' }}
                  ></div>
               </div>
            </div>
            
            <div className={styles.nodeStats}>
               <div className={styles.nodeItem}>
                  <div className={styles.btnIcon}>
                     <Image src={isLocal ? '/admin-images/local-node.png' : '/admin-images/cloud-node.png'} width={24} height={24} alt="Node" />
                  </div>
                  <div>
                     <p>{isLocal ? 'Local Development Node' : 'Cloud Production Node'}</p>
                     <small>{isLocal ? '127.0.0.1' : 'Remote Edge'}</small>
                  </div>
               </div>
               <div className={styles.nodeItem}>
                  <div className={styles.btnIcon}>
                     <Image src={isSecure ? '/admin-images/secure-ssl.png' : '/admin-images/insecure-ssl.png'} width={24} height={24} alt="Security" />
                  </div>
                  <div>
                     <p>{isSecure ? 'SSL Encrypted (HTTPS)' : 'Insecure Protocol (HTTP)'}</p>
                     <small>{isSecure ? 'Certificate Valid' : 'Security Risk'}</small>
                  </div>
               </div>
            </div>

            <div className={styles.maintenanceBanner}>
               <div className={styles.btnIcon}>
                  <Image src={app.inMaintenance ? '/admin-images/maintenance-mode.png' : '/admin-images/systems-ok.png'} width={24} height={24} alt="Status" />
               </div>
               <div>
                  <p>{app.inMaintenance ? 'Service is in Maintenance Mode' : 'All Systems Operational'}</p>
                  <small>{app.inMaintenance ? 'Global access restricted' : 'Public endpoints are live'}</small>
               </div>
            </div>
          </section>

          {/* Service Dependencies */}
          <section className={styles.detailsCard}>
            <div className={styles.sectionTitleRow}>
              <h3>Service Connectors</h3>
              <button className={styles.manageIconBtn} onClick={() => setIsInfraModalOpen(true)}>
                <div className={styles.btnIcon}>
                  <Image src={'/admin-images/plus.png'} width={18} height={18} alt="" />
                </div>
              </button>
            </div>
            <div className={styles.dependencyList}>
              {(app.dependencies && app.dependencies.length > 0) ? (
                app.dependencies.map((dep, idx) => (
                  <div key={idx} className={styles.dependencyItem}>
                    <div className={styles.depInfo}>
                      <span className={styles.depName}>{dep.name}</span>
                      <span className={styles.depType}>{dep.type}</span>
                    </div>
                    <div className={`${styles.statusDot} ${styles[dep.status]}`}></div>
                  </div>
                ))
              ) : (
                <p className={styles.emptyText}>No infrastructure dependencies registered.</p>
              )}
            </div>
          </section>

          {/* Quick Links */}
          <section className={styles.healthCard}>
            <div className={styles.sectionTitleRow}>
              <h3>Ecosystem Links</h3>
              <button className={styles.manageIconBtn} onClick={() => setIsInfraModalOpen(true)}>
                <div className={styles.btnIcon}>
                  <Image src={'/admin-images/add-link.png'} width={18} height={18} alt="" />
                </div>
              </button>
            </div>
            <div className={styles.linkGrid}>
              {(app.quickLinks && app.quickLinks.length > 0) ? (
                app.quickLinks.map((link, idx) => (
                  <a key={idx} href={link.url} target="_blank" rel="noreferrer" className={styles.linkCard}>
                    <div className={styles.btnIcon}>
                      <Image src={'/admin-images/link.png'} width={18} height={18} alt="" />
                    </div>
                    <span>{link.label}</span>
                  </a>
                ))
              ) : (
                <p className={styles.emptyText}>No quick links available.</p>
              )}
            </div>
          </section>

          {/* Audit Logs / Activity Feed */}
          <section className={styles.auditSection}>
            <div className={styles.sectionTitleRow}>
              <h3>Recent Administrative Activity</h3>
              <span className={styles.logCount}>{auditLogs.length} Entries</span>
            </div>
            <div className={styles.logList}>
               {auditLogs.length > 0 ? (
                 auditLogs.map((log) => (
                   <div key={log._id} className={styles.logItem}>
                      <div className={styles.logMeta}>
                         <span className={styles.logAdmin}>{log.adminName}</span>
                         <span className={styles.logDate}>
                            {new Date(log.createdAt).toLocaleString()}
                         </span>
                      </div>
                      <div className={styles.logContent}>
                         <span className={`${styles.logAction} ${styles[log.action.toLowerCase()]}`}>
                            {log.action.replace('_', ' ')}
                         </span>
                         <p className={styles.logDetails}>
                            {JSON.stringify(log.details)}
                         </p>
                      </div>
                   </div>
                 ))
               ) : (
                 <p className={styles.emptyText}>No recent activity recorded for this app.</p>
               )}
            </div>
          </section>

          {/* Danger Zone: Delete Hub */}
          <section className={styles.dangerZone}>
             <div className={styles.dangerLeft}>
                <h3>Danger Zone</h3>
                <p>Removing this app will permanently delete its configuration and historical logs. This action cannot be undone.</p>
             </div>
             <button 
                className={styles.deleteBtn} 
                onClick={handleDelete}
                disabled={deleteAppMutation.isPending}
             >
                {deleteAppMutation.isPending ? 'Removing...' : (deleteConfirm ? 'Are you sure? Click again' : 'Delete this Hub')}
             </button>
          </section>
        </div>

        {/* Modular Edit Modal */}
        <EditAppModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          appData={app}
        />

        {/* Modular Infra Manager Modal */}
        <InfraManagerModal 
          isOpen={isInfraModalOpen} 
          onClose={() => setIsInfraModalOpen(false)} 
          appData={app}
        />

      </div>
    </AdminLayout>
  );
}
