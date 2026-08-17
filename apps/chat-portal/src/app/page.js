/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import { useState, useEffect } from 'react';
import AuthScreen from '@/components/Auth/AuthScreen';
import ChatScreen from '@/components/Chat/ChatScreen';
import style from '@/app/page.module.css'

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
      <div className={style.crashContainer}>
        <h2 className={style.crashTitle}>🚨 Client-Side Runtime Crash</h2>
        <pre className={style.crashPre}>{globalError}</pre>
        <button onClick={() => window.location.reload()} className={style.crashButton}>Reload Page</button>
      </div>
    );
  }

  return (
    <main className={style.main}>
      {!authData ? (
        <AuthScreen onAuthComplete={handleAuthComplete} />
      ) : (
        <ChatScreen profile={authData.profile} token={authData.token} />
      )}
    </main>
  );
}
