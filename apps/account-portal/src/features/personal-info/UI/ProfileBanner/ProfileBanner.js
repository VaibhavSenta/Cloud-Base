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
        <Image 
          src={getSafeAvatar(user.profilePic)} 
          alt="Profile" 
          width={100} 
          height={100} 
          className={styles.avatarImg}
          priority
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
