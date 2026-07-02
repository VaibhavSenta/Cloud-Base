'use client';
import { useSecureQuery } from '@/hooks/useSecureQuery';
import Dashboard from '@/components/Dashboard/Dashboard';
import api from '@/utils/api';

export default function DashboardPage() {
  const { data: user } = useSecureQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const response = await api.get('/auth/me');
      const userData = response.data.data;
      return {
        ...userData,
        username: userData.userName || userData.username
      };
    },
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  if (!user) return null;

  return <Dashboard user={user} />;
}
