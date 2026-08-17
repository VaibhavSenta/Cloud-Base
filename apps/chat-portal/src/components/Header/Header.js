/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import HeaderMobile from './Mobile/HeaderMobile';

export default function Header(props) {
  // Mobile-First Priority wrapper
  return <HeaderMobile {...props} />;
}
