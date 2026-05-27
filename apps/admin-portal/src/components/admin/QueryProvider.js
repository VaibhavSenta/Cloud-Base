'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';

// 🎯 GLOBAL AXIOS INTERCEPTOR: Catch all 401s and redirect to login
if (typeof window !== 'undefined') {
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      // Agar backend se 401 (Unauthorized) aaye, toh seedha login par bhej do
      if (error.response && error.response.status === 401) {
        console.warn("Unauthorized access detected. Redirecting to login...");
        window.location.href = '/'; 
      }
      return Promise.reject(error);
    }
  );
}

// 🎯 GLOBAL SINGLETON: Taaki window focus ya tab switch pe client re-create na ho
let browserQueryClient = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server side: Hamesha naya client banao
    return new QueryClient({
      defaultOptions: {
        queries: { staleTime: 1000 * 60 * 5 },
      },
    });
  } else {
    // Client side: Ek baar ban gaya toh wahi use karo (Singleton)
    if (!browserQueryClient) {
      browserQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,                // 🎯 Hamesha fresh data check karega
            gcTime: 1000 * 60 * 60 * 24, // 24 hours tak cache mein rakhega
            refetchOnWindowFocus: true,  // Doosri site se aate hi refresh
            refetchOnMount: true,
            retry: 1,                    // Agar fail hua toh ek baar retry karega
          },
        },
      });
    }
    return browserQueryClient;
  }
}

export default function QueryProvider({ children }) {
  const queryClient = getQueryClient();

  // 🎯 BFCache & Tab Focus Fix
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Tab Focus Detected: Re-validating critical queries...");
        queryClient.invalidateQueries(); // Saare data ko fresh mark kar do
      }
    };

    const handleBFCache = (event) => {
      const isBackForward = performance.getEntriesByType('navigation')[0]?.type === 'back_forward';
      if (event.persisted || isBackForward) {
        console.log("BFCache/Back-Forward Detected: Forcing fresh data sync...");
        window.location.reload(); 
      }
    };

    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handleBFCache);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handleBFCache);
    };
  }, [queryClient]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}