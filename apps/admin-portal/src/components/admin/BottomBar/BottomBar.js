'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import styles from './BottomBar.module.css';

const BottomBar = () => {
  const pathname = usePathname();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: '/admin-images/dashboard.png' },
    { name: 'Apps', path: '/apps', icon: '/admin-images/cloud-node.png' },
    { name: 'Users', path: '/dashboard/users', icon: '/admin-images/group.png' },
    { name: 'Profile', path: '/profile', icon: '/admin-icon.png' }, // Can be dynamic avatar later
  ];

  return (
    <nav className={styles.bottomBar}>
      <div className={styles.bottomBarWrapper}>
        {navItems.map((item) => {
          const isActive = pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
          
          return (
            <Link key={item.name} href={item.path} className={`${styles.navItem} ${isActive ? styles.active : ''}`}>
              <div className={styles.iconWrapper}>
                <Image 
                  src={item.icon} 
                  alt={item.name} 
                  width={22} 
                  height={22} 
                  style={{ 
                    // When active: turn pure white. When inactive: turn light grey/inverted
                    filter: item.name === 'Profile' ? 'none' : (isActive ? 'brightness(0) invert(1)' : 'brightness(0) invert(0.5)'),
                    borderRadius: item.name === 'Profile' ? '50%' : '0'
                  }} 
                />
              </div>
              <span className={styles.navLabel}>{item.name}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomBar;
