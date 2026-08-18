/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import ChatHeader from './Mobile/Chat/ChatHeader';
import ActiveChatHeader from './Mobile/ActiveChat/ActiveChatHeader';
import styles from './Header.module.css';

export default function Header({ activeConv, ...props }) {
  // Mobile-First Priority wrapper with unified div container for easy customization
  return (
    <div className={styles.headerContainer}>
      {activeConv ? (
        <ActiveChatHeader activeConv={activeConv} setActiveConv={props.setActiveConv} />
      ) : (
        <ChatHeader activeTab={props.activeTab} chatSearchText={props.chatSearchText} setChatSearchText={props.setChatSearchText} />
      )}
    </div>
  );
}
