import ActiveSessions from '@/features/security-settings/ActiveSessions';

export const metadata = {
  title: 'Active Sessions | Cloud-Base',
  description: 'Manage and revoke your active logged in device sessions securely.',
};

export default function ActiveSessionsPage() {
  return <ActiveSessions />;
}
