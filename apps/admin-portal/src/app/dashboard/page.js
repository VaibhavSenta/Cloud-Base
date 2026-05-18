'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';

import { useQuery, useQueryClient } from '@tanstack/react-query';
export default function DashboardHome() {

  const queryClient = useQueryClient();

  // 1. React Query setup (Design & Caching logic)
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const response = await axios.get('/api/admin/cloudbase/mediacategories/list');
      return response.data.data.categories || response.data || [];
    },
    refetchOnMount: 'always', 
    staleTime: Infinity,

    // Memory State Fallback: Pehle se check karega ki memory state active hai ya nahi
    initialData: () => {
      return queryClient.getQueryData(['categories']);
    }
  });

  const categories = categoriesData || [];


  return (
    <AdminLayout >
      <div style={{ padding: '10px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>
          Welcome back, Admin Console Live 🚀
        </h2>
        <p style={{ color: '#888888', fontSize: '14px', lineHeight: '1.5' }}>
          Yahan tumhare systems, movies counters, aur live storage limits ka short summary data dikhega. 
          Mobile screen par left-top corner mein ☰ click karke menu check karo, mast response karega!
        </p>
      </div>
    </AdminLayout>
  );
}