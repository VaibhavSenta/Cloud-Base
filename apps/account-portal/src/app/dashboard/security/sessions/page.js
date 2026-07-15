import LoggedSessions from '@/features/security-settings/LoggedSessions';

export const metadata = {
  title: 'Active Sessions | Cloud-Base',
  description: 'Manage and revoke your active logged in device sessions securely.',
};

export default function LoggedSessionsPage() {
  return <LoggedSessions />;
}
