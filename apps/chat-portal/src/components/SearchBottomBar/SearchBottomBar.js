/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import SearchBottomBarMobile from './Mobile/SearchBottomBarMobile';

export default function SearchBottomBar(props) {
  // Mobile-First Priority wrapper
  return <SearchBottomBarMobile {...props} />;
}
