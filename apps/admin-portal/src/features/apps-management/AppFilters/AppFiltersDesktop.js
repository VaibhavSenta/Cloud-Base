/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import NextImage from 'next/image';
import styles from './AppFiltersDesktop.module.css';

const AppFiltersDesktop = ({ searchTerm, setSearchTerm, envFilter, setEnvFilter }) => {
  return (
    <section className={styles.filterSection}>
      <div className={styles.searchBox}>
        <NextImage src="/admin-images/search.png" width={18} height={18} alt="Search" />
        <input 
          type="text" 
          placeholder="Search apps by title or slug..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className={styles.envFilters}>
        {['all', 'production', 'staging', 'development'].map((env) => (
          <button 
            key={env}
            className={`${styles.filterChip} ${envFilter === env ? styles.activeChip : ''}`}
            onClick={() => setEnvFilter(env)}
          >
            {env.charAt(0).toUpperCase() + env.slice(1)}
          </button>
        ))}
      </div>
    </section>
  );
};

export default AppFiltersDesktop;
