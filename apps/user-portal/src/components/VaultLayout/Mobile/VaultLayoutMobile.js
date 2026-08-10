'use client';

import React from 'react';
import styles from './VaultLayoutMobile.module.css';

export default function VaultLayoutMobile() {
  const dummyData = [
    { id: 1, name: 'Project Alpha', type: 'Folder', size: '--', date: 'Oct 24' },
    { id: 2, name: 'Q3 Report', type: 'PDF', size: '2.4 MB', date: 'Oct 20' },
    { id: 3, name: 'Design Assets', type: 'Folder', size: '--', date: 'Oct 15' },
    { id: 4, name: 'Hero Banner', type: 'Image', size: '4.1 MB', date: 'Oct 12' },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitle}>VAULT</div>
        <button className={styles.newButton}>NEW</button>
      </header>
      
      <div className={styles.searchContainer}>
        <input 
          type="text" 
          className={styles.searchInput} 
          placeholder="Search vault..."
        />
      </div>

      <div className={styles.listContainer}>
        <div className={styles.gridHeader}>
          <div>Name</div>
          <div>Type</div>
          <div>Size</div>
          <div>Date</div>
        </div>

        {dummyData.map((item) => (
          <div key={item.id} className={styles.itemRow}>
            <div className={styles.itemName}>{item.name}</div>
            <div className={styles.itemType}>{item.type}</div>
            <div className={styles.itemSize}>{item.size}</div>
            <div className={styles.itemDate}>{item.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
