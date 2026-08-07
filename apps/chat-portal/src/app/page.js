'use client';

import { useState, useEffect } from 'react';
import AuthScreen from '@/components/Auth/AuthScreen';
import ChatScreen from '@/components/Chat/ChatScreen';

export default function Home() {
  const [authData, setAuthData] = useState(null);
  const [globalError, setGlobalError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      const stack = event.error?.stack || '';
      const message = event.message || '';
      // Ignore benign development-only HMR stylesheet removal errors
      if (message.includes('removeChild') || stack.includes('mini-css-extract-plugin') || stack.includes('hotModuleReplacement')) {
        console.warn('⚠️ Ignored benign Next.js HMR style sheet hot-reload error:', message);
        return;
      }
      setGlobalError(stack || message || 'Unknown error');
    };
    const handleRejection = (event) => {
      const reason = event.reason?.stack || event.reason?.message || String(event.reason) || '';
      if (reason.includes('removeChild') || reason.includes('mini-css-extract-plugin')) {
        return;
      }
      setGlobalError(reason || 'Promise rejection');
    };
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  const handleAuthComplete = (profile, token) => {
    setAuthData({ profile, token });
  };

  if (globalError) {
    return (
      <div style={{ padding: '20px', background: '#3b0000', color: '#ff8888', fontFamily: 'monospace', fontSize: '13px', zIndex: 99999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, overflow: 'auto' }}>
        <h2 style={{ margin: 0, color: '#ff4444' }}>🚨 Client-Side Runtime Crash</h2>
        <pre style={{ whiteSpace: 'pre-wrap', marginTop: '10px' }}>{globalError}</pre>
        <button onClick={() => window.location.reload()} style={{ marginTop: '15px', padding: '8px 16px', background: '#ff4444', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reload Page</button>
      </div>
    );
  }

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
