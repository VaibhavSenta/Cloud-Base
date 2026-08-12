/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import useDevToolsProtection from '@/hooks/useDevToolsProtection';

export default function DevToolsGuard({ children }) {
  useDevToolsProtection();
  return <>{children}</>;
}
