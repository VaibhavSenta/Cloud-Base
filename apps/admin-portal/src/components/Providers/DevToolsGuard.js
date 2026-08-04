'use client';

import useDevToolsProtection from '@/hooks/useDevToolsProtection';

export default function DevToolsGuard({ children }) {
  useDevToolsProtection();
  return <>{children}</>;
}
