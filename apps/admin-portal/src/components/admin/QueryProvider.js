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

// 🎯 Initialize state from LocalStorage (if available) to eliminate delay
if (typeof window !== 'undefined') {
  try {
    const cached = localStorage.getItem('__cb_encryption_cache__');
    if (cached) {
      const parsed = JSON.parse(cached);
      // Only use if less than 4 hours old
      if (Date.now() - parsed.lastFetched < 4 * 60 * 60 * 1000) {
        encryptionConfig = { ...encryptionConfig, ...parsed };
        console.log("💾 Encryption cache loaded from Storage.");
      }
    }
  } catch (e) {
    console.warn("Failed to load encryption cache.");
  }
}

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
  const [securityError, setSecurityError] = useState(null);

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

        // 💾 Save to localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('__cb_encryption_cache__', JSON.stringify({
            isEnabled: encryptionConfig.isEnabled,
            publicKey: encryptionConfig.publicKey,
            keyID: encryptionConfig.keyID,
            lastFetched: encryptionConfig.lastFetched
          }));
        }

        console.log(`🔒 Encryption state synced. Enabled: ${encryptionConfig.isEnabled}`);
        setSecurityError(null); // Clear any previous error
      } catch (err) {
        console.error("Encryption Handshake Failed:", err);
        encryptionConfig.isFetching = false;
        setSecurityError("Security Handshake Failed. Connection to secure gateway lost.");
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
          // Backup original unencrypted data for potential retries (only if not already backed up)
          if (!config._unencryptedData) {
            config._unencryptedData = JSON.stringify(config.data);
          }

          console.log("🛡️ Encrypting outbound request...");
          try {
            const dataToEncrypt = JSON.parse(config._unencryptedData);
            const encryptedPayload = await EncryptionUtils.hybridEncrypt(
              encryptionConfig.publicKey,
              dataToEncrypt
            );
            
            config.data = {
              ...encryptedPayload,
              keyID: encryptionConfig.keyID
            };
          } catch (err) {
            console.error("Encryption Interceptor Error:", err);
            setSecurityError("Encryption Failed: Data could not be secured.");
          }
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // 3. Response Interceptor
    const responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response && error.response.status === 401) {
          console.warn("Unauthorized access detected. Redirecting to login...");
          if (typeof window !== 'undefined' && window.location.pathname !== '/') {
            window.location.href = '/'; 
          }
        }

        if (error.response && (error.response.data?.code === 'DECRYPTION_FAILED' || error.response.data?.code === 'DECRYPTION_SESSION_EXPIRED' || error.response.status === 403)) {
          console.warn("🛡️ Security mismatch/expiry detected. Resetting handshake...");
          
          // Avoid infinite loops
          if (originalRequest._retryCount && originalRequest._retryCount >= 1) {
            setSecurityError("Security synced. Please try your action again.");
            return Promise.reject(error);
          }
          
          originalRequest._retryCount = 1;

          // Reset handshake on decryption failure/expiry
          encryptionConfig.publicKey = null;
          encryptionConfig.lastFetched = 0;
          
          if (typeof window !== 'undefined') {
            localStorage.removeItem('__cb_encryption_cache__');
          }

          try {
            // Try to re-handshake immediately
            await ensureHandshake();
            
            // Restore the original unencrypted data before retrying so the request interceptor can re-encrypt it with the new key
            if (originalRequest._unencryptedData) {
              originalRequest.data = JSON.parse(originalRequest._unencryptedData);
            }
            
            console.log("🔄 Auto-retrying the request with new security keys...");
            return axios(originalRequest);
          } catch (retryErr) {
            setSecurityError("Security synced. Please try your action again.");
            return Promise.reject(retryErr);
          }
        }

        if (error.code === 'ERR_NETWORK') {
          setSecurityError("Network Error: Gateway is unreachable. Please check your connection.");
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
      {securityError && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          background: '#1a1a1a',
          borderLeft: '4px solid #ff4d4d',
          padding: '16px 24px',
          borderRadius: '8px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          gap: '15px',
          color: '#fff',
          maxWidth: '400px',
          animation: 'slideIn 0.3s ease-out'
        }}>
          <span style={{ color: '#ff4d4d', fontSize: '24px' }}>⚠️</span>
          <div>
            <h4 style={{ margin: 0, fontSize: '14px', color: '#ff4d4d' }}>Security Alert</h4>
            <p style={{ margin: '4px 0 0', fontSize: '13px', opacity: 0.8 }}>{securityError}</p>
          </div>
          <button 
            onClick={() => setSecurityError(null)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '20px',
              marginLeft: '10px'
            }}
          >
            ×
          </button>
          <style>{`
            @keyframes slideIn {
              from { transform: translateX(100%); opacity: 0; }
              to { transform: translateX(0); opacity: 1; }
            }
          `}</style>
        </div>
      )}
      {children}
    </QueryClientProvider>
  );
}