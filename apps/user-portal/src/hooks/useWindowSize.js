/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import { useState, useEffect } from 'react';

const useWindowSize = () => {
  // SSR ke waqt initial value mobile-friendly rakhte hain (e.g., 375px)
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 375,
    height: typeof window !== 'undefined' ? window.innerHeight : 667,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // First mount par size check kar lo
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return windowSize;
};

export default useWindowSize;
