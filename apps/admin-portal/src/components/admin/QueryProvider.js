'use client';

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Isko function ke BAHAR rakhna hai. Ab ye tab memory mein lock ho gaya!
const globalQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, 
      gcTime: 1000 * 60 * 60, 
      refetchOnWindowFocus: false,
      refetchOnMount: false, 
    },
  },
});

export default function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={globalQueryClient}>
      {children}
    </QueryClientProvider>
  );
}