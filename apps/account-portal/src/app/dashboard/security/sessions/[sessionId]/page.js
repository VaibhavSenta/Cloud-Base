import SessionDetail from '@/features/security-settings/SessionDetail';

export const metadata = {
  title: 'Session Details | Nothing Box',
  description: 'View detailed security metadata for this active session and manage access.',
};

export default async function SessionDetailPage({ params }) {
  const { sessionId } = await params;
  return <SessionDetail sessionId={sessionId} />;
}
