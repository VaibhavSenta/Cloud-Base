/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import { useState, useEffect } from 'react';
import BottomBarMobile from './Mobile/BottomBarMobile';

// Helper hook to track viewport width
function useWindowSize() {
  const [windowSize, setWindowSize] = useState({ width: undefined });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    function handleResize() {
      setWindowSize({ width: window.innerWidth });
    }

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
}

export default function BottomBar({ activeTab, setActiveTab, profile }) {
  const { width } = useWindowSize();

  // Mobile-First Priority default
  return <BottomBarMobile activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />;
}
