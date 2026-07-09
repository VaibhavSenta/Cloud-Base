'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';
import styles from './UserFiltersMobile.module.css';

const UserFiltersMobile = ({ searchTerm, setSearchTerm, roleFilter, setRoleFilter }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <section className={styles.mobileFilters}>
      <div className={styles.searchBox}>
        <NextImage src="/admin-images/search.png" width={16} height={16} alt="Search" />
        <input 
          type="text" 
          placeholder="Search citizens..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className={styles.menuContainer}>
        <button 
          className={`${styles.menuBtn} ${roleFilter !== 'all' ? styles.active : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <NextImage src="/admin-images/more_vert.png" width={20} height={20} alt="More" />
        </button>

        {isMenuOpen && (
          <div className={styles.dropdown}>
            <p className={styles.dropdownTitle}>Filter by Role</p>
            <div className={styles.chipGrid}>
              {[
                { label: 'All Roles', value: 'all' },
                { label: 'Standard Users', value: 'User' },
                { label: 'Administrators', value: 'Admin' },
                { label: 'Root Access', value: 'Root' }
              ].map((role) => (
                <button 
                  key={role.value}
                  className={`${styles.filterChip} ${roleFilter === role.value ? styles.activeChip : ''}`}
                  onClick={() => {
                    setRoleFilter(role.value);
                    setIsMenuOpen(false);
                  }}
                >
                  {role.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default UserFiltersMobile;
