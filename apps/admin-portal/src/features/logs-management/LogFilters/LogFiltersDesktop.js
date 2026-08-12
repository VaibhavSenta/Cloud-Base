/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import React from 'react';
import NextImage from 'next/image';
import styles from './LogFiltersDesktop.module.css';

const LogFiltersDesktop = ({ searchTerm, setSearchTerm, actionFilter, setActionFilter }) => {
  return (
    <section className={styles.actionBar}>
      <div className={styles.searchBox}>
        <NextImage src="/admin-images/search.png" width={18} height={18} alt="Search" />
        <input 
          type="text" 
          placeholder="Filter logs by admin, app or details..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className={styles.filterGroup}>
        <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          <option value="all">All Actions</option>
          <option value="login">Login</option>
          <option value="update">Update</option>
          <option value="delete">Delete</option>
          <option value="add">Add</option>
        </select>
      </div>
    </section>
  );
};

export default LogFiltersDesktop;
