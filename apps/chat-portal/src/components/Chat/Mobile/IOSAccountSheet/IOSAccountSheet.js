/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import { useState, useEffect, useRef } from 'react';
import { NothingboxLogo } from '@cloudbase/ui-brand';
import { config } from '@/utils/config';
import api from '@/utils/api';
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
  onUpdateProfile,
  pushEnabled,
  isTogglingPush,
  onTogglePush,
  onEditProfile,
  onLogout
}) {
  const [currentView, setCurrentView] = useState('main'); // 'main' | 'details'
  const [readReceipts, setReadReceipts] = useState(true);
  const [lastSeenEnabled, setLastSeenEnabled] = useState(true);

  // Inline Nickname Editing States
  const [isEditingNickname, setIsEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState('');
  const [nicknameError, setNicknameError] = useState('');
  const [isSavingNickname, setIsSavingNickname] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const avatarInputRef = useRef(null);

  // Reset to main view whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentView('main');
      setIsEditingNickname(false);
      setNicknameError('');
    }
  }, [isOpen]);

  // Handle Nickname Save
  const handleSaveNickname = async () => {
    const cleaned = (nicknameInput || '').trim().toLowerCase().replace(/@/g, '');
    if (!cleaned || cleaned === localProfile.chatUsername) {
      setIsEditingNickname(false);
      return;
    }
    if (cleaned.length < 3) {
      setNicknameError('Must be at least 3 characters');
      return;
    }
    setIsSavingNickname(true);
    setNicknameError('');
    try {
      const res = await api.put('/chat/users/profile/username', { username: cleaned });
      if (res.data?.status === 'success' || res.data?.profile) {
        if (onUpdateProfile) {
          onUpdateProfile({ ...localProfile, chatUsername: cleaned });
        }
        setIsEditingNickname(false);
      }
    } catch (err) {
      setNicknameError(err.response?.data?.error || err.message || 'Username already taken');
    } finally {
      setIsSavingNickname(false);
    }
  };

  // Handle Avatar Image Upload
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size exceeds 5MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target.result;
      setIsUploadingAvatar(true);
      try {
        const res = await api.put('/chat/users/profile/avatar', { avatarUrl: base64Data });
        if (res.data?.status === 'success' || res.data?.profile) {
          if (onUpdateProfile) {
            onUpdateProfile({ ...localProfile, avatarUrl: base64Data });
          }
        }
      } catch (err) {
        console.error('Failed to upload avatar:', err);
      } finally {
        setIsUploadingAvatar(false);
      }
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className={`${styles.backdrop} ${isClosing ? styles.backdropClosing : ''}`}
        onClick={onClose}
      />
      <div
        className={`${styles.container} ${isClosing ? styles.containerClosing : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Hidden Avatar Input for Chat Profile */}
        <input
          type="file"
          ref={avatarInputRef}
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleAvatarFileChange}
        />

        {currentView === 'main' ? (
          <>
            {/* Sheet Header */}
            <div className={styles.header}>
              <div className={styles.titleGroup}>
                <NothingboxLogo size={34} />
                <span className={styles.title}>Chat Profile</span>
              </div>
              <button className={styles.closeBtn} onClick={onClose}>✕</button>
            </div>

            {/* Sheet Body */}
            <div className={styles.body}>
              {/* Group 1: User Info & Account Center Link */}
              <div className={styles.groupCard}>
                <div className={styles.userRow} onClick={() => setCurrentView('details')}>
                  {localProfile.avatarUrl ? (
                    <img src={localProfile.avatarUrl} alt="Avatar" className={styles.userAvatar} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      <img src="/profile-icon.svg" alt="Default Avatar" className={styles.defaultIcon} />
                    </div>
                  )}
                  <div className={styles.userMeta}>
                    <span className={styles.userName}>
                      {localProfile.chatUsername || localProfile.username || 'User'}
                    </span>
                    <span className={styles.userSubtitle}>Profile info, preferences and settings</span>
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
                      {localProfile.accountProfilePic || localProfile.profilePic ? (
                        <img src={localProfile.accountProfilePic || localProfile.profilePic} alt="Account Profile" className={styles.serviceAvatar} />
                      ) : (
                        <img src="/profile-icon.svg" alt="Icon" className={styles.serviceIcon} />
                      )}
                    </div>
                    <span className={styles.serviceTitle}>Account Center</span>
                  </div>
                  <div className={styles.serviceRight}>
                    <span>{`${localProfile.firstName || ''} ${localProfile.lastName || ''}`.trim() || localProfile.chatUsername}</span>
                  </div>
                </a>
              </div>

              {/* Group 2: Account Details */}
              <div className={styles.groupSection}>
                <span className={styles.groupTitle}>Profile Info</span>
                <div className={styles.groupCard}>
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>Display Name</span>
                    <span className={styles.rowValue}>{localProfile.firstName} {localProfile.lastName}</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>Nickname</span>
                    <span className={styles.rowValue}>{localProfile.chatUsername}</span>
                  </div>
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>Email</span>
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
                    <button onClick={() => setCurrentView('details')} className={styles.rowActionBtn}>
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
          </>
        ) : (
          /* Sub-page view: Profile Details, Preferences, Settings */
          <>
            <div className={styles.subPageHeader}>
              <button className={styles.backBtn} onClick={() => setCurrentView('main')} title="Back">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={styles.backArrow}>
                  <line x1="19" y1="12" x2="5" y2="12"></line>
                  <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
              </button>
              <span className={styles.title}>Settings</span>
              {isEditingNickname ? (
                <button className={styles.checkBtn} onClick={handleSaveNickname} title="Save Nickname">
                  <img src="/check.svg" alt="Save" className={styles.checkIcon} />
                </button>
              ) : (
                <button className={styles.closeBtn} onClick={onClose}>✕</button>
              )}
            </div>

            <div className={styles.body}>
              {/* Section 1: Profile Details */}
              <div className={styles.groupSection}>
                <span className={styles.groupTitle}>Profile Details</span>
                <div className={styles.groupCard}>
                  {/* Avatar upload row */}
                  <div className={styles.userRow} onClick={() => avatarInputRef.current?.click()}>
                    {localProfile.avatarUrl ? (
                      <img src={localProfile.avatarUrl} alt="Avatar" className={styles.userAvatar} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        <img src="/profile-icon.svg" alt="Default Avatar" className={styles.defaultIcon} />
                      </div>
                    )}
                    <div className={styles.userMeta}>
                      <span className={styles.userName}>
                        {localProfile.firstName || ''} {localProfile.lastName || ''}
                      </span>
                      <span className={styles.userSubtitle}>
                        {isUploadingAvatar ? 'Uploading avatar...' : 'Tap to change chat avatar'}
                      </span>
                    </div>
                  </div>

                  {/* Display Name (Read-only from Account Portal) */}
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>Display Name</span>
                    <span className={styles.rowValue}>{localProfile.firstName} {localProfile.lastName}</span>
                  </div>

                  {/* Nickname with Direct Inline Cursor Editing */}
                  <div
                    className={styles.rowClickable}
                    onClick={() => {
                      if (!isEditingNickname) {
                        setIsEditingNickname(true);
                        setNicknameInput(localProfile.chatUsername || '');
                        setNicknameError('');
                      }
                    }}
                  >
                    <span className={styles.rowLabel}>Nickname</span>
                    {isEditingNickname ? (
                      <input
                        type="text"
                        className={styles.nicknameInput}
                        value={nicknameInput}
                        onChange={(e) => setNicknameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_\.]/g, ''))}
                        autoFocus
                        onFocus={(e) => {
                          const val = e.target.value;
                          e.target.setSelectionRange(val.length, val.length);
                        }}
                        onBlur={() => {
                          handleSaveNickname();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.target.blur();
                          }
                          if (e.key === 'Escape') {
                            setIsEditingNickname(false);
                            setNicknameError('');
                          }
                        }}
                      />
                    ) : (
                      <span className={styles.rowValue}>{localProfile.chatUsername}</span>
                    )}
                  </div>
                  {nicknameError && (
                    <div className={styles.errorText} style={{ paddingLeft: '14px' }}>{nicknameError}</div>
                  )}

                  {/* Email (Read-only from Account Portal) */}
                  <div className={styles.row}>
                    <span className={styles.rowLabel}>Email</span>
                    <span className={styles.rowValue}>{localProfile.email || 'None'}</span>
                  </div>
                </div>
              </div>

              {/* Section 2: Preferences */}
              <div className={styles.groupSection}>
                <span className={styles.groupTitle}>Preferences</span>
                <div className={styles.groupCard}>
                  {/* Block list */}
                  <div className={styles.row}>
                    <div className={styles.rowMeta}>
                      <span className={styles.rowLabel}>Block list</span>
                      <span className={styles.rowSubLabel}>Manage blocked contacts</span>
                    </div>
                    <span className={styles.rowValue} style={{ color: '#8e8e93', fontSize: '0.82rem' }}>0 blocked</span>
                  </div>

                  {/* Read receipts */}
                  <div className={styles.row}>
                    <div className={styles.rowMeta}>
                      <span className={styles.rowLabel}>Read receipts</span>
                      <span className={styles.rowSubLabel}>Toggle &quot;seen&quot; indicators</span>
                    </div>
                    <button
                      className={`${styles.pushToggleBtn} ${readReceipts ? styles.pushToggleBtnActive : ''}`}
                      onClick={() => setReadReceipts(prev => !prev)}
                    >
                      {readReceipts ? 'ON' : 'OFF'}
                    </button>
                  </div>

                  {/* Last seen status */}
                  <div className={styles.row}>
                    <div className={styles.rowMeta}>
                      <span className={styles.rowLabel}>Last seen status</span>
                      <span className={styles.rowSubLabel}>Hide online presence</span>
                    </div>
                    <button
                      className={`${styles.pushToggleBtn} ${lastSeenEnabled ? styles.pushToggleBtnActive : ''}`}
                      onClick={() => setLastSeenEnabled(prev => !prev)}
                    >
                      {lastSeenEnabled ? 'ON' : 'OFF'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Section 3: Settings */}
              <div className={styles.groupSection} style={{ marginBottom: '32px' }}>
                <span className={styles.groupTitle}>Settings</span>
                <div className={styles.groupCard}>
                  {/* Push Notifications */}
                  <div className={styles.row}>
                    <div className={styles.rowMeta}>
                      <span className={styles.rowLabel}>Push Notifications</span>
                      <span className={styles.rowSubLabel}>Real-time message alerts</span>
                    </div>
                    <button
                      className={`${styles.pushToggleBtn} ${pushEnabled ? styles.pushToggleBtnActive : ''}`}
                      onClick={onTogglePush}
                      disabled={isTogglingPush}
                    >
                      {isTogglingPush ? '...' : (pushEnabled ? 'ON' : 'OFF')}
                    </button>
                  </div>

                  {/* Manage Security & 2FA */}
                  <div className={styles.row}>
                    <a href={`${config.accountPortalUrl}/dashboard`} target="_blank" rel="noreferrer" className={styles.rowActionBtn} style={{ textDecoration: 'none' }}>
                      <span className={styles.actionLabel}>Manage Security & 2FA</span>
                    </a>
                  </div>

                  {/* Account Center Settings */}
                  <div className={styles.row}>
                    <a href={`${config.accountPortalUrl}/dashboard`} target="_blank" rel="noreferrer" className={styles.rowActionBtn} style={{ textDecoration: 'none' }}>
                      <span className={styles.actionLabel}>Account Center Settings</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
