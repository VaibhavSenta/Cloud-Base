/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import { NothingboxLogo } from '@cloudbase/ui-brand';
import { config } from '@/utils/config';
import styles from './IOSAccountSheet.module.css';

/**
 * IOSAccountSheet — iOS-style bottom sheet profile modal (IMG_2246.PNG design).
 * Spring slide-up / slide-down exit animations, logo header, profile card,
 * account center link, settings options, and logout action.
 *
 * All profile state, editing logic, push notification handlers,
 * and close animation timing remain in ChatScreenMobile.
 */
export default function IOSAccountSheet({
  isOpen,
  isClosing,
  onClose,
  localProfile,
  pushEnabled,
  isTogglingPush,
  onTogglePush,
  onEditProfile,
  onLogout
}) {
  if (!isOpen) return null;

  return (
    <div
      className={`${styles.backdrop} ${isClosing ? styles.backdropClosing : ''}`}
      onClick={onClose}
    >
      <div
        className={`${styles.container} ${isClosing ? styles.containerClosing : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sheet Header */}
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <NothingboxLogo size={34} />
            <span className={styles.title}>Nothingbox Chat</span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Sheet Body */}
        <div className={styles.body}>
          {/* Group 1: User Info & Account Center Link */}
          <div className={styles.groupCard}>
            <div className={styles.userRow} onClick={onEditProfile}>
              {localProfile.avatarUrl ? (
                <img src={localProfile.avatarUrl} alt="Avatar" className={styles.userAvatar} />
              ) : (
                <div className={styles.avatarPlaceholder}>
                  <img src="/profile-icon.svg" alt="Default Avatar" className={styles.defaultIcon} />
                </div>
              )}
              <div className={styles.userMeta}>
                <span className={styles.userName}>
                  {localProfile.firstName || localProfile.chatUsername} {localProfile.lastName || ''}
                </span>
                <span className={styles.userSubtitle}>Account info, payments and settings</span>
              </div>
            </div>

            <a
              href={`${config.accountPortalUrl}/dashboard`}
              target="_blank"
              rel="noreferrer"
              className={styles.serviceRow}
            >
              <div className={styles.serviceLeft}>
                <div className={styles.serviceIconWrapper}>
                  <img src="/profile-icon.svg" alt="Icon" className={styles.serviceIcon} />
                </div>
                <span className={styles.serviceTitle}>Account Center</span>
              </div>
              <div className={styles.serviceRight}>
                <span>{localProfile.chatUsername}</span>
              </div>
            </a>
          </div>

          {/* Group 2: Account Details */}
          <div className={styles.groupSection}>
            <span className={styles.groupTitle}>Account Info</span>
            <div className={styles.groupCard}>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Display Name</span>
                <span className={styles.rowValue}>{localProfile.firstName} {localProfile.lastName}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Chat Username</span>
                <span className={styles.rowValue}>{localProfile.chatUsername}</span>
              </div>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Email Address</span>
                <span className={styles.rowValue}>{localProfile.email || 'None'}</span>
              </div>
            </div>
          </div>

          {/* Group 3: Preferences & Management */}
          <div className={styles.groupSection}>
            <span className={styles.groupTitle}>Preferences & Security</span>
            <div className={styles.groupCard}>
              <div className={styles.row}>
                <span className={styles.rowLabel}>Push Notifications</span>
                <button
                  className={`${styles.pushToggleBtn} ${pushEnabled ? styles.pushToggleBtnActive : ''}`}
                  onClick={onTogglePush}
                  disabled={isTogglingPush}
                >
                  {isTogglingPush ? '...' : (pushEnabled ? 'ON' : 'OFF')}
                </button>
              </div>
              <div className={styles.row}>
                <button onClick={onEditProfile} className={styles.rowActionBtn}>
                  <span className={styles.actionLabel}>Edit Profile Details</span>
                </button>
              </div>
              <div className={styles.row}>
                <a href={`${config.accountPortalUrl}/dashboard`} target="_blank" rel="noreferrer" className={styles.rowActionBtn} style={{ textDecoration: 'none' }}>
                  <span className={styles.actionLabel}>Manage Security & 2FA</span>
                </a>
              </div>
            </div>
          </div>

          {/* Group 4: Session Logout */}
          <div className={styles.groupSection} style={{ marginBottom: '32px' }}>
            <div className={styles.dangerCard}>
              <button onClick={onLogout} className={styles.dangerBtn}>
                Logout Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
