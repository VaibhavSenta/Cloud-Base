/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import Footer from '@/components/Footer/Footer';
import styles from './IOSBottomNav.module.css';

/**
 * IOSBottomNav — Thin wrapper around the existing Footer/BottomBar components.
 * Renders the bottom navigation tabs (Chat, Friends, Groups, Search)
 * with update indicator badges.
 *
 * The actual tab rendering logic lives in LibraryBottomBar and
 * SearchBottomBarMobile. This wrapper handles the profile-modal
 * tab interception (clicking settings triggers the account sheet).
 */
export default function IOSBottomNav({
  activeTab,
  setActiveTab,
  profile,
  searchUsername,
  setSearchUsername,
  handleSearchUser,
  isSearching,
  hasChatUpdate,
  hasFriendsUpdate,
  hasGroupsUpdate
}) {
  return (
    <div className={styles.navWrapper}>
      <Footer
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        searchUsername={searchUsername}
        setSearchUsername={setSearchUsername}
        handleSearchUser={handleSearchUser}
        isSearching={isSearching}
        hasChatUpdate={hasChatUpdate}
        hasFriendsUpdate={hasFriendsUpdate}
        hasGroupsUpdate={hasGroupsUpdate}
      />
    </div>
  );
}
