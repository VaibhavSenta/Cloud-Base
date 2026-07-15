'use client';
import { useSecureQuery } from '@/hooks/useSecureQuery';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import api from '@/utils/api';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import LoadingScreen from '@/components/UI/LoadingScreen/LoadingScreen';

export default function DashboardRootLayout({ children }) {
  const router = useRouter();

  const { data: user, isLoading, status } = useSecureQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        console.log('📡 Dashboard Layout: Checking session...');
        const response = await api.get('/auth/me');
        return response.data.data;
      } catch (err) {
        console.error('Session check failed:', err);
        throw err;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (status === 'error' || (!isLoading && !user)) {
      console.log('🛡️ Dashboard Layout: Access denied. Redirecting to login...');
      router.replace('/');
    }
  }, [user, isLoading, status, router]);

  if (isLoading || status === 'error' || !user) {
    return <LoadingScreen />;
  }

  return (
    <DashboardLayout user={user}>
      {children}
    </DashboardLayout>
  );
}
