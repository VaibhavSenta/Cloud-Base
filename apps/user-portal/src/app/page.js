'use client';

import React, { useState, useEffect } from 'react';
import styles from './page.module.css';
import NextImage from 'next/image';
import axios from 'axios';

export default function Home() {
  const [dynamicCategories, setCategories] = useState([]);
  
  // Static Core Categories (The Hubs)
  const coreHubs = [
    { title: 'Cinema Hub', desc: '4K Movies & Series', icon: '🎬', link: '/movies', color: '#ff4d4d' },
    { title: 'Music Sync', desc: 'Lossless Audio Library', icon: '🎵', link: '/music', color: '#1a73e8' },
    { title: 'App Forge', desc: 'Software & Tools', icon: '🚀', link: '/apps', color: '#10b981' },
    { title: 'Game Zone', desc: 'Windows & Mobile Games', icon: '🎮', link: '/games', color: '#f59e0b' },
  ];

  useEffect(() => {
    const fetchHome = async () => {
      try {
        const res = await axios.get('/api/v1/home');
        setCategories(res.data.categories || []);
      } catch (err) {
        console.error("Link to ecosystem failed:", err);
      }
    };
    fetchHome();
  }, []);

  return (
    <main className={styles.main}>
      {/* 🌟 HERO SECTION */}
      <section className={styles.hero}>
        <div className="container">
          <div className={styles.badge}>v1.0 • Global Release</div>
          <h1>The Cloud<span>Base</span><br/>Experience</h1>
          <p>Explore a massive library of high-quality digital assets. From 4K cinema to professional software, everything is just one click away.</p>
          <div className={styles.heroActions}>
            <a href="#explore" className={styles.cta}>Start Exploring</a>
            <a href="/login" className={styles.secondaryBtn}>Sign In</a>
          </div>
        </div>
      </section>

      <div className="container" id="explore">
        {/* 📂 CORE HUBS SECTION */}
        <div className={styles.sectionTitle}>
          <div>
            <h2>Digital Ecosystem</h2>
            <p>Select a hub to begin your journey</p>
          </div>
          <a href="/categories">View All</a>
        </div>
        
        <div className={styles.grid}>
          {coreHubs.map((hub, i) => (
            <a href={hub.link} key={i} className={styles.categoryCard}>
              <div className={styles.cardIcon} style={{ background: `${hub.color}15`, color: hub.color }}>{hub.icon}</div>
              <h3>{hub.title}</h3>
              <p>{hub.desc}</p>
              <div className={styles.cardArrow}>→</div>
            </a>
          ))}
        </div>

        {/* 🎬 FEATURED CONTENT (DYNAMIC OR MOCK) */}
        <div className={styles.sectionTitle}>
          <div>
            <h2>Cinema Spotlights</h2>
            <p>Recently added 4K HDR releases</p>
          </div>
          <a href="/movies">Explore Cinema</a>
        </div>
        
        <div className={styles.contentGrid}>
          {[1, 2, 3, 4, 5, 6].map((m) => (
            <div key={m} className={styles.contentCard}>
               {/* Use a colored placeholder since we don't have movie posters yet */}
              <div style={{ width: '100%', height: '100%', background: '#111' }}></div>
              <div className={styles.overlay}>
                <span>Action • Thriller</span>
                <h4>Matrix Resurrection: 4K</h4>
              </div>
            </div>
          ))}
        </div>

        {/* 💻 ESSENTIAL SOFTWARES */}
        <div className={styles.sectionTitle}>
          <div>
            <h2>Software Forge</h2>
            <p>Verified tools for creators and developers</p>
          </div>
          <a href="/software">Browse Tools</a>
        </div>
        
        <div className={styles.softwareList}>
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={styles.softwareItem}>
              <div className={styles.softIcon}>⚡</div>
              <div className={styles.softInfo}>
                <h4>Adobe Photoshop 2026</h4>
                <p>Graphics & Design • 2.4 GB</p>
              </div>
              <button className={styles.downloadBtn}>Download</button>
            </div>
          ))}
        </div>
      </div>

      {/* 🏁 FOOTER */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerTop}>
            <div className={styles.footerLogo}>
              <NextImage src="/icons/logo.jpeg" width={48} height={48} alt="CB" style={{ borderRadius: '12px' }} />
              <h3>CloudBase</h3>
            </div>
            <div className={styles.footerLinks}>
              <a href="#">Terms</a>
              <a href="#">Privacy</a>
              <a href="#">Security</a>
              <a href="#">Support</a>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <p>&copy; 2026 CloudBase Global Ecosystem. Developed by Vaibhav Senta.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
