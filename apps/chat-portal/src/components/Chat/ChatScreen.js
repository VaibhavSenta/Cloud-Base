'use client';

import { useSocket } from '@/hooks/useSocket';
import ChatScreenMobile from './Mobile/ChatScreenMobile';

export default function ChatScreen({ profile, token }) {
  // Initialize Socket.io connection hook
  const { socket, isConnected, sendTypingStatus, sendKeyRotation } = useSocket(Boolean(profile));

  // Mobile-First Priority
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
