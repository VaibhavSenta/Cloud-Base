/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import { useEffect } from 'react';

/**
 * Custom hook to disable Right-Click Context Menu and DevTools keyboard shortcuts
 * ONLY in Production (NODE_ENV === 'production').
 * 
 * In Development (NODE_ENV === 'development'), DevTools and inspect element remain
 * 100% enabled for testing!
 */
export default function useDevToolsProtection() {
  useEffect(() => {
    // DO NOT block DevTools during local development!
    if (process.env.NODE_ENV === 'development') {
      return;
    }

    // 1. Prevent Right-Click Context Menu
    const handleContextMenu = (e) => {
      e.preventDefault();
    };

    // 2. Prevent F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && ['I', 'J', 'C', 'i', 'j', 'c'].includes(e.key)) ||
        (e.ctrlKey && ['u', 'U'].includes(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);
}
