/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import { useSocket } from '@/hooks/useSocket';
import useWindowSize from '@/hooks/useWindowSize';
import ChatScreenMobile from './Mobile/ChatScreenMobile';
import ChatScreenDesktop from './Desktop/ChatScreenDesktop';

export default function ChatScreen({ profile, token }) {
  const { width } = useWindowSize();
  const { socket, isConnected, sendTypingStatus, sendKeyRotation } = useSocket(Boolean(profile));

  // Render Desktop Split-Screen Layout for large viewports (>= 1024px)
  if (width >= 1024) {
    return (
      <ChatScreenDesktop
        profile={profile}
        token={token}
        socket={socket}
        isConnected={isConnected}
        sendTypingStatus={sendTypingStatus}
        sendKeyRotation={sendKeyRotation}
      />
    );
  }

  // Mobile Layout (default for Mobile-First priority)
  return (
    <ChatScreenMobile
      profile={profile}
      token={token}
      socket={socket}
      isConnected={isConnected}
      sendTypingStatus={sendTypingStatus}
      sendKeyRotation={sendKeyRotation}
    />
  );
}
