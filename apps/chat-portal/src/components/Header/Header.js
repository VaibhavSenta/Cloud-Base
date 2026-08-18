/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import ChatHeader from './Mobile/Chat/ChatHeader';
import ActiveChatHeader from './Mobile/ActiveChat/ActiveChatHeader';
import DefaultHeader from './Mobile/Default/DefaultHeader';
import styles from './Header.module.css';

export default function Header({ activeConv, activeTab, setActiveTab, ...props }) {
  // Mobile-First Priority wrapper with unified div container for easy customization
  return (
    <div className={styles.headerContainer}>
      {activeConv ? (
        <ActiveChatHeader activeConv={activeConv} setActiveConv={props.setActiveConv} />
      ) : activeTab === 'chat' ? (
        <ChatHeader chatSearchText={props.chatSearchText} setChatSearchText={props.setChatSearchText} />
      ) : (
        <DefaultHeader 
          title={activeTab === 'friends' ? 'Friends' : activeTab === 'groups' ? 'Groups' : activeTab === 'search' ? 'Search' : 'Settings'} 
          onBack={() => setActiveTab('chat')}
        />
      )}
    </div>
  );
}
