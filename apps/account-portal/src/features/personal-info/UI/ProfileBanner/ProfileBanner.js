/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import Image from 'next/image';
import styles from './ProfileBanner.module.css';

/**
 * Reusable Profile Cover Banner Component
 * Handles layout rendering for user metadata, profile photo click trigger, and styling.
 */
export default function ProfileBanner({ user, getSafeAvatar, onClick }) {
  if (!user) return null;

  return (
    <div className={styles.bannerCard}>
      <div className={styles.avatarWrapper} onClick={onClick}>
        <img 
          src={getSafeAvatar(user.profilePic)} 
          alt="Profile" className={styles.avatarImg}
          onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/user-icon.png'; }}
        />
      </div>
      <div className={styles.bannerText}>
        <h2>{user.firstName} {user.lastName}</h2>
        <p className={styles.userEmail}>{user.email}</p>
        <span className={styles.uploadHint}>Change Profile Picture</span>
      </div>
    </div>
  );
}
