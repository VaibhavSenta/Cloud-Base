/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import { useState, useEffect } from 'react';
import LibraryBottomBar from './Mobile/Library/LibraryBottomBar';
import SearchBottomBarMobile from './Mobile/Search/SearchBottomBarMobile';

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

export default function BottomBar({ activeTab, setActiveTab, profile, ...rest }) {
  const { width } = useWindowSize();

  // Mobile-First Priority default
  if (activeTab === 'search') {
    return <SearchBottomBarMobile setActiveTab={setActiveTab} {...rest} />;
  }

  // Render the new LibraryBottomBar instead of DefaultBottomBar
  return (
    <LibraryBottomBar 
      onSearchClick={() => setActiveTab('search')} 
    />
  );
}
