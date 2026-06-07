'use client';

import React from 'react';
import Link from 'next/link';
import NextImage from 'next/image';
import styles from './Navbar.module.css';
import { usePathname } from 'next/navigation';

const Navbar = () => {
  const pathname = usePathname();

  return (
    <nav className={styles.nav}>
      <div className={`${styles.navInner} container`}>
        <Link href="/" className={styles.logo}>
          <NextImage src="/icons/logo.jpeg" width={32} height={32} alt="L" style={{ borderRadius: '6px' }} />
          <div>Cloud<span>Base</span></div>
        </Link>

        <div className={styles.links}>
          <Link href="/movies" className={`${styles.navLink} ${pathname === '/movies' ? styles.active : ''}`}>Movies</Link>
          <Link href="/music" className={`${styles.navLink} ${pathname === '/music' ? styles.active : ''}`}>Music</Link>
          <Link href="/apps" className={`${styles.navLink} ${pathname === '/apps' ? styles.active : ''}`}>Apps</Link>
          <Link href="/games" className={`${styles.navLink} ${pathname === '/games' ? styles.active : ''}`}>Games</Link>
        </div>

        <div className={styles.actions}>
           <button className={styles.searchBtn}>🔍</button>
           <button style={{ backgroundColor: '#222', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600' }}>Login</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
