'use client';

import React, { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import axios from 'axios';
import { EncryptionUtils } from '@/utils/encryption';

// 🎯 GLOBAL ENCRYPTION STATE
let encryptionConfig = {
  isEnabled: false,
  publicKey: null,
  keyID: null,
  lastFetched: 0,
  isFetching: false
};

// 🎯 GLOBAL SINGLETON: Taaki window focus ya tab switch pe client re-create na ho
let browserQueryClient = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    return new QueryClient({
      defaultOptions: {
        queries: { staleTime: 1000 * 60 * 5 },
      },
    });
  } else {
    if (!browserQueryClient) {
      browserQueryClient = new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 0,
            gcTime: 1000 * 60 * 60 * 24,
            refetchOnWindowFocus: true,
            refetchOnMount: true,
            retry: 1,
          },
        },
      });
    }
    return browserQueryClient;
  }
}

export default function QueryProvider({ children }) {
  const queryClient = getQueryClient();

  // 🎯 Setup Interceptors safely inside useEffect to avoid HMR loops
  useEffect(() => {
    if (window.__CLOUD_BASE_INIT__) return; // Already initialized
    window.__CLOUD_BASE_INIT__ = true;
    console.log("🛠️ CloudBase: Initializing Security Interceptors...");

    // 1. Lazy Handshake Function
    const ensureHandshake = async () => {
      if (encryptionConfig.isFetching || (Date.now() - encryptionConfig.lastFetched < 60000 && encryptionConfig.publicKey)) {
        return;
      }
      try {
        encryptionConfig.isFetching = true;
        const response = await axios.get('/api/admin/auth/handshake', { _isHandshake: true });

        encryptionConfig = {
          isEnabled: response.data.isEncryptionEnabled === true,
          publicKey: response.data.publicKey || null,
          keyID: response.data.keyID || null,
          lastFetched: Date.now(),
          isFetching: false
        };

        console.log(`🔒 Encryption state synced. Enabled: ${encryptionConfig.isEnabled}`);
      } catch (err) {
        console.error("Encryption Handshake Failed:", err);
        encryptionConfig.isFetching = false;
      }
    };

    // Expose to window for forced refresh from Settings page
    window.__FORCE_RE_HANDSHAKE__ = () => {
      console.log("🔄 Forced Encryption Sync requested...");
      encryptionConfig.publicKey = null; 
      encryptionConfig.lastFetched = 0;   
      ensureHandshake();
    };

    // 2. Request Interceptor
    const requestInterceptor = axios.interceptors.request.use(
      async (config) => {
        if (config.url.includes('/handshake') || config._isHandshake) {
          return config;
        }

        if (!encryptionConfig.publicKey && !encryptionConfig.isFetching) {
          await ensureHandshake();
        }

        if (encryptionConfig.isEnabled && (Date.now() - encryptionConfig.lastFetched > 3.5 * 60 * 60 * 1000)) {
          await ensureHandshake();
        }

        if (encryptionConfig.isEnabled && encryptionConfig.publicKey && config.data && ['post', 'put', 'patch'].includes(config.method)) {
          console.log("🛡️ Encrypting outbound request...");
          try {
            const encryptedPayload = await EncryptionUtils.hybridEncrypt(
              encryptionConfig.publicKey,
              config.data
            );
            
            config.data = {
              ...encryptedPayload,
              keyID: encryptionConfig.keyID
            };
          } catch (err) {
            console.error("Encryption Interceptor Error:", err);
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 3. Response Interceptor
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          console.warn("Unauthorized access detected. Redirecting to login...");
          window.location.href = '/'; 
        }
        return Promise.reject(error);
      }
    );

    // Cleanup on unmount (important for HMR)
    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
      window.__CLOUD_BASE_INIT__ = false;
    };
  }, []);

  // 🎯 BFCache & Tab Focus Fix
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        queryClient.invalidateQueries(); 
      }
    };

    const handleBFCache = (event) => {
      // Temporarily disabled to debug 'Compiling' hang
      /*
      const isBackForward = performance.getEntriesByType('navigation')[0]?.type === 'back_forward';
      if (event.persisted || isBackForward) {
        window.location.reload(); 
      }
      */
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