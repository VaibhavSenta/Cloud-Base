/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import React from 'react';
import NextImage from 'next/image';
import styles from './UserFiltersDesktop.module.css';

const UserFiltersDesktop = ({ searchTerm, setSearchTerm, roleFilter, setRoleFilter }) => {
  return (
    <section className={styles.actionBar}>
      <div className={styles.searchBox}>
        <NextImage src="/admin-images/search.png" width={18} height={18} alt="Search" />
        <input 
          type="text" 
          placeholder="Search by name, email or username..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className={styles.filterGroup}>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          <option value="User">Standard Users</option>
          <option value="Admin">Administrators</option>
          <option value="Root">Root Access</option>
        </select>
      </div>
    </section>
  );
};

export default UserFiltersDesktop;
