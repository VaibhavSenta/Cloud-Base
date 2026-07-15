import ActivityDetail from '@/features/security-settings/ActivityDetail';

export const metadata = {
  title: 'Activity Log Detail | Cloud-Base',
  description: 'View detailed security audit log metadata.',
};

export default async function ActivityDetailPage({ params }) {
  const { logId } = await params;
  return <ActivityDetail logId={logId} />;
}
