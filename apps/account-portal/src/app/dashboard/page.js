'use client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Dashboard from '@/components/Dashboard/Dashboard';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import api from '@/utils/api';

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: user, isLoading, isError, status } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        console.log('📡 Dashboard: Checking session...');
        const response = await api.get('/auth/me');
        const userData = response.data.data;
        // Fix for naming consistency
        const normalizedUser = {
            ...userData,
            username: userData.userName || userData.username
        };
        console.log('✅ Dashboard: Session found for:', normalizedUser.username);
        return normalizedUser;
      } catch (err) {
        console.error('❌ Dashboard: Session invalid:', err.response?.status || err.message);
        throw err;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    if (status === 'error' || (!isLoading && !user)) {
      console.log('🛡️ Dashboard: Access denied. Redirecting to login...');
      router.replace('/');
    }
  }, [user, isLoading, status, router]);

  if (isLoading) {
    return (
      <div style={{ 
        background: '#000', 
        minHeight: '100dvh', 
        width: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: '#fff' 
      }}>
        <div>Initializing Hub...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <DashboardLayout user={user}>
      <Dashboard user={user} />
    </DashboardLayout>
  );
}
