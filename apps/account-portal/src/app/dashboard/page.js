/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import { useSecureQuery } from '@/hooks/useSecureQuery';
import Dashboard from '@/components/Dashboard/Dashboard';
import DashboardSkeleton from '@/components/Dashboard/Skeleton/DashboardSkeleton';
import api from '@/utils/api';

export default function DashboardPage() {
  const { data: user, isLoading } = useSecureQuery({
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

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (!user) return null;

  return <Dashboard user={user} />;
}
