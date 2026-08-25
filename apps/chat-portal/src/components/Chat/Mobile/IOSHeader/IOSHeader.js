/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import Header from '@/components/Header/Header';
import styles from './IOSHeader.module.css';

/**
 * IOSHeader — Thin wrapper around the existing Header component.
 * Renders the appropriate header variant (ChatHeader, ActiveChatHeader, DefaultHeader)
 * based on the current navigation state.
 *
 * All state management and tab switching logic remain in ChatScreenMobile.
 */
export default function IOSHeader({
  activeConv,
  setActiveConv,
  activeTab,
  setActiveTab,
  onProfileClick,
  profile,
  chatSearchText,
  setChatSearchText
}) {
  return (
    <div className={styles.headerWrapper}>
      <Header
        activeConv={activeConv}
        setActiveConv={setActiveConv}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onProfileClick={onProfileClick}
        profile={profile}
        chatSearchText={chatSearchText}
        setChatSearchText={setChatSearchText}
      />
    </div>
  );
}
