/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';
import styles from './LogFiltersMobile.module.css';

const LogFiltersMobile = ({ searchTerm, setSearchTerm, actionFilter, setActionFilter }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <section className={styles.mobileFilters}>
      <div className={styles.searchBox}>
        <NextImage src="/admin-images/search.png" width={16} height={16} alt="Search" />
        <input 
          type="text" 
          placeholder="Filter logs..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.menuContainer}>
        <button 
          className={`${styles.menuBtn} ${actionFilter !== 'all' ? styles.active : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <NextImage src="/admin-images/more_vert.png" width={20} height={20} alt="More" />
        </button>

        {isMenuOpen && (
          <div className={styles.dropdown}>
            <p className={styles.dropdownTitle}>Filter by Action</p>
            <div className={styles.chipGrid}>
              {[
                { label: 'All Actions', value: 'all' },
                { label: 'Login', value: 'login' },
                { label: 'Update', value: 'update' },
                { label: 'Delete', value: 'delete' },
                { label: 'Add', value: 'add' }
              ].map((action) => (
                <button 
                  key={action.value}
                  className={`${styles.filterChip} ${actionFilter === action.value ? styles.activeChip : ''}`}
                  onClick={() => {
                    setActionFilter(action.value);
                    setIsMenuOpen(false);
                  }}
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LogFiltersMobile;
