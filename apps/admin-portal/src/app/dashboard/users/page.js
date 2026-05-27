'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import styles from './users.module.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import Image from 'next/image';

export default function UsersManagementPage() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const limit = 10;

  // 1. Debounce Search Logic
  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset to page 1 on new search
    }, 500); // 500ms delay

    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 2. Fetch Users with Debounced Search
  const { data: userData, isLoading, error } = useQuery({
    queryKey: ['ecosystemUsers', page, debouncedSearchTerm, roleFilter],
    queryFn: async () => {
      const res = await axios.get(`/api/admin/users/all`, {
        params: { page, limit, search: debouncedSearchTerm, role: roleFilter }
      });
      return res.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const users = userData?.data || [];
  const pagination = userData?.pagination || { page: 1, pages: 1, total: 0 };

  // 2. Toggle Status Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, newStatus }) => {
      const res = await axios.patch(`/api/admin/users/status/${id}`, { status: newStatus });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ecosystemUsers'] });
    },
  });

  const handleStatusToggle = (user) => {
    const newStatus = user.accountStatus === 'active' ? 'banned' : 'active';
    if (confirm(`Are you sure you want to change ${user.firstName}'s status to ${newStatus}?`)) {
      statusMutation.mutate({ id: user._id, newStatus });
    }
  };

  const handleExportCSV = () => {
    // Direct link to the export endpoint
    window.location.href = '/api/admin/users/export-csv';
  };

  return (
    <AdminLayout>
      <div className={styles.usersWrapper}>
        
        <header className={styles.usersHeader}>
          <div className={styles.headerTitle}>
            <h1>Ecosystem Population</h1>
            <p>Manage and monitor all users across CloudBase unified domain</p>
          </div>
          <div className={styles.headerStats}>
            <div className={styles.statMini}>
               <span className={styles.statLabel}>Total Citizens</span>
               <span className={styles.statVal}>{pagination.total}</span>
            </div>
          </div>
        </header>

        {/* Action Bar */}
        <section className={styles.actionBar}>
           <div className={styles.searchBox}>
              <span className="material-symbols-outlined">search</span>
              <input 
                type="text" 
                placeholder="Search by name, email or username..." 
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              />
           </div>
           <div className={styles.filterGroup}>
              <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}>
                 <option value="all">All Roles</option>
                 <option value="User">Standard Users</option>
                 <option value="Admin">Administrators</option>
              </select>
              <button className={styles.exportBtn} onClick={handleExportCSV}>
                 <span className="material-symbols-outlined">download</span>
                 <span>Export CSV</span>
              </button>
           </div>
        </section>

        {/* Users Table */}
        <div className={styles.tableContainer}>
          {isLoading && !userData ? (
            <div className={styles.loader}>Syncing with User Node...</div>
          ) : (
            <>
              <table className={styles.usersTable}>
                <thead>
                  <tr>
                    <th>Identity</th>
                    <th>Access Role</th>
                    <th>Registration</th>
                    <th>Account Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className={styles.userCell}>
                           <div className={styles.avatarBox}>
                              {user.profilePic && !user.profilePic.includes('defaultLogos') ? (
                                <Image src={user.profilePic} width={32} height={32} alt="" />
                              ) : (
                                <span>{user.firstName?.charAt(0) || user.userName?.charAt(0)}</span>
                              )}
                           </div>
                           <div className={styles.userInfo}>
                              <p>{user.firstName} {user.lastName || ''}</p>
                              <small>{user.email}</small>
                           </div>
                        </div>
                      </td>
                      <td>
                        <span className={`${styles.roleBadge} ${styles[(user.role || 'User').toLowerCase()]}`}>
                          {user.role || 'User'}
                        </span>
                      </td>
                      <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div className={styles.statusToggle}>
                           <div className={`${styles.statusDot} ${user.accountStatus === 'active' ? styles.active : styles.banned}`}></div>
                           <span>{user.accountStatus}</span>
                        </div>
                      </td>
                      <td>
                        <div className={styles.actionGroup}>
                           <button className={styles.iconBtn} title="View Profile">
                              <Image src="/admin-images/link.png" width={16} height={16} alt="View" />
                           </button>
                           <button 
                              className={`${styles.iconBtn} ${user.accountStatus === 'active' ? styles.danger : ''}`} 
                              onClick={() => handleStatusToggle(user)}
                              title={user.accountStatus === 'active' ? 'Ban User' : 'Activate User'}
                              disabled={statusMutation.isPending}
                           >
                              <span className="material-symbols-outlined">
                                {user.accountStatus === 'active' ? 'block' : 'check_circle'}
                              </span>
                           </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className={styles.noResults}>
                   <span className="material-symbols-outlined">person_search</span>
                   <p>No citizens found in this sector.</p>
                </div>
              )}

              {/* Pagination Controls */}
              <div className={styles.pagination}>
                 <div className={styles.pageInfo}>
                    Showing {users.length} of {pagination.total} users
                 </div>
                 <div className={styles.pageBtns}>
                    <button 
                      disabled={page === 1} 
                      onClick={() => setPage(p => p - 1)}
                      className={styles.pageBtn}
                    >
                      Previous
                    </button>
                    {[...Array(pagination.pages)].map((_, i) => (
                      <button 
                        key={i+1}
                        className={`${styles.pageBtn} ${page === i+1 ? styles.activePage : ''}`}
                        onClick={() => setPage(i+1)}
                      >
                        {i+1}
                      </button>
                    )).slice(Math.max(0, page - 3), Math.min(pagination.pages, page + 2))}
                    <button 
                      disabled={page === pagination.pages} 
                      onClick={() => setPage(p => p + 1)}
                      className={styles.pageBtn}
                    >
                      Next
                    </button>
                 </div>
              </div>
            </>
          )}
        </div>

      </div>
    </AdminLayout>
  );
}
