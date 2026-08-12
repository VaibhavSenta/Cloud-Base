/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import React, { useState } from 'react';
import styles from './logs.module.css';
import NextImage from 'next/image';
import { useSecureQuery } from 'secure-query-cache';
import axios from 'axios';
import LogFilters from '@/features/logs-management/LogFilters/LogFilters';
import useDebounce from '@/hooks/useDebounce';

export default function LogsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const { data: logs = [], isLoading, error, refetch } = useSecureQuery({
    queryKey: ['globalLogs'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/managedapps/utils/logs');
      return res.data.data || [];
    },
    refetchInterval: 30000,
  });

  const debouncedSearch = useDebounce(searchTerm, 300);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.adminName?.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
      log.appTitle?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
      log.details?.toString().toLowerCase().includes(debouncedSearch.toLowerCase());
    
    const matchesAction = actionFilter === 'all' || log.action?.toLowerCase() === actionFilter.toLowerCase();
    
    return matchesSearch && matchesAction;
  });

  return (
    <div className={styles.logsWrapper}>
        <header className={styles.logsHeader}>
          <div className={styles.headerTitle}>
            <h1>Audit Logs</h1>
            <p>Track all administrative actions across the CloudBase cluster</p>
          </div>
          <button className={styles.refreshBtn} onClick={() => refetch()}>
             <NextImage src="/admin-images/sync.png" width={18} height={18} alt="Sync" />
             <span>Refresh Logs</span>
          </button>
        </header>

        {/* Action Bar - Search & Filters */}
        <LogFilters 
          searchTerm={searchTerm} 
          setSearchTerm={setSearchTerm} 
          actionFilter={actionFilter} 
          setActionFilter={setActionFilter} 
        />

        <section className={styles.logsContainer}>
          {isLoading ? (
            <div className={styles.loader}>Syncing with Audit Service...</div>
          ) : error ? (
            <div className={styles.errorMessage}>
              <NextImage src="/admin-images/warning.png" width={48} height={48} alt="Error" />
              <p>Failed to load logs. Please check API connection.</p>
              <button onClick={() => refetch()}>Retry Connection</button>
            </div>
          ) : filteredLogs.length > 0 ? (
            <div className={styles.logsTableWrapper}>
              <table className={styles.logsTable}>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Target App</th>
                    <th>IP Address</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log._id}>
                      <td className={styles.timeCell} data-label="Timestamp">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className={styles.adminCell} data-label="Admin">
                        <div className={styles.adminInfo}>
                          <span className={styles.adminName}>{log.adminName}</span>
                          <span className={styles.adminId}>{log.adminId}</span>
                        </div>
                      </td>
                      <td className={styles.actionCell} data-label="Action">
                        <span className={`${styles.actionBadge} ${styles[log.action.toLowerCase()] || ''}`}>
                          {log.action}
                        </span>
                      </td>
                      <td className={styles.targetCell} data-label="Target App">
                        {log.appTitle || 'Global'}
                      </td>
                      <td className={styles.ipCell} data-label="IP Address">{log.ipAddress || '---'}</td>
                      <td className={styles.detailsCell} data-label="Details">
                        {typeof log.details === 'object' 
                          ? JSON.stringify(log.details).replace(/[{}"]/g, '').replace(/:/g, ': ')
                          : log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={styles.emptyLogs}>
              <NextImage src="/admin-images/person-search.png" width={64} height={64} alt="No Logs" style={{ opacity: 0.5 }} />
              <p>No audit logs found matching your criteria.</p>
              <button onClick={() => { setSearchTerm(''); setActionFilter('all'); }}>Clear Filters</button>
            </div>
          )}
        </section>
      </div>
  );
}
