'use client';

import { useState } from 'react';
import AuthScreen from '@/components/Auth/AuthScreen';
import ChatScreen from '@/components/Chat/ChatScreen';

export default function Home() {
  const [authData, setAuthData] = useState(null);

  const handleAuthComplete = (profile, token) => {
    setAuthData({ profile, token });
  };

  return (
    <main style={{ minHeight: '100dvh', backgroundColor: '#000000' }}>
      {!authData ? (
        <AuthScreen onAuthComplete={handleAuthComplete} />
      ) : (
        <ChatScreen profile={authData.profile} token={authData.token} />
      )}
    </main>
  );
}
