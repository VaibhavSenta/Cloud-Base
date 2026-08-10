'use client';

import React from 'react';
import useWindowSize from '@/hooks/useWindowSize';
import VaultLayoutMobile from './Mobile/VaultLayoutMobile';

export default function VaultLayout() {
  const { width } = useWindowSize();
  
  // Mobile-first approach: for now we only render the mobile layout
  // We can add logic to render a Desktop layout later if width > X
  return <VaultLayoutMobile />;
}
