'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';
import styles from './AppFiltersMobile.module.css';

const AppFiltersMobile = ({ searchTerm, setSearchTerm, envFilter, setEnvFilter }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <section className={styles.mobileFilters}>
      <div className={styles.searchBox}>
        <NextImage src="/admin-images/search.png" width={16} height={16} alt="Search" />
        <input 
          type="text" 
          placeholder="Search apps..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.menuContainer}>
        <button 
          className={`${styles.menuBtn} ${envFilter !== 'all' ? styles.active : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <NextImage src="/admin-images/more_vert.png" width={20} height={20} alt="More" />
        </button>

        {isMenuOpen && (
          <div className={styles.dropdown}>
            <p className={styles.dropdownTitle}>Filter by Environment</p>
            <div className={styles.chipGrid}>
              {['all', 'production', 'staging', 'development'].map((env) => (
                <button 
                  key={env}
                  className={`${styles.filterChip} ${envFilter === env ? styles.activeChip : ''}`}
                  onClick={() => {
                    setEnvFilter(env);
                    setIsMenuOpen(false);
                  }}
                >
                  {env}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default AppFiltersMobile;
