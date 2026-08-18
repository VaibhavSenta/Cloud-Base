/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import DefaultHeader from './Mobile/Default/DefaultHeader';
import ActiveChatHeader from './Mobile/ActiveChat/ActiveChatHeader';

export default function Header({ activeConv, ...props }) {
  // Mobile-First Priority router
  if (activeConv) {
    return <ActiveChatHeader activeConv={activeConv} setActiveConv={props.setActiveConv} />;
  }

  return <DefaultHeader activeTab={props.activeTab} chatSearchText={props.chatSearchText} setChatSearchText={props.setChatSearchText} />;
}
