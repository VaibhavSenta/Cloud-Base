/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import useWindowSize from '@/hooks/useWindowSize';
import ButtonMobile from './Mobile/ButtonMobile';

/**
 * Button — Component Wrapper Pattern
 * Renders Mobile variant for screens < 768px (Mobile-First Priority Rule).
 */
export default function Button(props) {
  const { width } = useWindowSize();
  const isMobile = width ? width < 768 : true;

  if (isMobile) {
    return <ButtonMobile {...props} />;
  }

  // Fallback to Mobile variant for now (Mobile-First Priority rule)
  return <ButtonMobile {...props} />;
}
