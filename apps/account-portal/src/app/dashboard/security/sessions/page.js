/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import ActiveSessions from '@/features/security-settings/ActiveSessions';

export const metadata = {
  title: 'Active Sessions | Nothing Box',
  description: 'Manage and revoke your active logged in device sessions securely.',
};

export default function ActiveSessionsPage() {
  return <ActiveSessions />;
}
