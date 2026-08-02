'use client';

import { useState, useEffect } from 'react';
import api, { securePost } from '@/utils/api';
import { useRSA } from '@/hooks/useRSA';
import { config } from '@/utils/config';
import AuthScreenMobile from './Mobile/AuthScreenMobile';

/**
 * AuthScreen — Handles SSO login via account.localhost and in-app instant signup.
 * 
 * SSO Flow (Login):
 * 1. User clicks "Login" → redirects to account.localhost?redirect=chat.localhost/playground
 * 2. User logs in on account.localhost → cookie set with domain=localhost
 * 3. account.localhost redirects back to chat.localhost/playground
 * 4. On mount, this component detects the shared cookie via /auth/me and proceeds
 * 
 * Instant Signup Flow:
 * 1. User fills email+password in chat-portal itself
 * 2. Calls account-api /auth/signup directly (securePost with encryption)
 * 3. Cookie is set with domain=localhost (shared)
 * 4. Proceeds to username selection stage
 */
export default function AuthScreen({ onAuthComplete }) {
  const [loading, setLoading] = useState(true); // Start true for initial SSO check
  const [error, setError] = useState('');
  const [ssoChecked, setSsoChecked] = useState(false);
  const [initialStage, setInitialStage] = useState('auth');
  const { generateKeyPair } = useRSA();

  // SSO Check: On mount, check if user is already authenticated via shared cookie
  useEffect(() => {
    let isMounted = true;
    const checkExistingAuth = async () => {
      try {
        const meResponse = await api.get('/auth/me');
        if (meResponse.data?.success && meResponse.data?.data) {
          console.log('🔑 SSO: User already authenticated via shared cookie.');
          try {
            const profileResponse = await api.get('/chat/users/profile');
            if (profileResponse.data?.profile) {
              onAuthComplete(profileResponse.data.profile, 'sso-cookie');
              return;
            }
          } catch (profileErr) {
            if (isMounted) setInitialStage('username');
          }
        }
      } catch (err) {
        console.log('🔓 SSO: No active session found. Rendering Login UI.');
      } finally {
        if (isMounted) {
          setSsoChecked(true);
          setLoading(false);
        }
      }
    };

    checkExistingAuth();
    return () => { isMounted = false; };
  }, [onAuthComplete]);

  // SSO Login: Redirect to account.localhost for centralized login
  const handleSSOLogin = () => {
    const currentUrl = window.location.origin + window.location.pathname;
    const accountLoginUrl = `${config.accountPortalUrl}?continue=${currentUrl}`;
    console.log('🔄 SSO: Redirecting to account portal for login:', accountLoginUrl);
    window.location.href = accountLoginUrl;
  };

  // Instant Signup: In-app signup flow (stays in chat-portal)
  const handleInstantSignup = async (email, password) => {
    setLoading(true);
    setError('');
    try {
      const response = await securePost(`${config.accountApiUrl}/auth/signup`, {
        email,
        password,
        username: email.split('@')[0] + Math.floor(Math.random() * 1000)
      });

      const { token, user } = response.data;
      if (!token) throw new Error('Token verification parameters missing.');

      // Cookie is already set by account-api with domain=localhost (shared)
      window.__cb_session_token = token;
      setLoading(false);
      return true; // Signal to move to username stage
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Signup failed.');
      setLoading(false);
      return false;
    }
  };

  const handleAuthenticate = async (isLogin, email, password) => {
    if (isLogin) {
      // SSO: Redirect to account.localhost
      handleSSOLogin();
      return false; // Will redirect, so return false
    } else {
      // Instant Signup: In-app flow
      return await handleInstantSignup(email, password);
    }
  };

  const handleCheckUsername = async (username) => {
    try {
      const response = await api.post('/chat/users/check-username', { username });
      return response.data.available;
    } catch (err) {
      return false;
    }
  };

  const handleCreateProfile = async (username) => {
    setLoading(true);
    setError('');
    try {
      // 1. Generate new asymmetric RSA Handshake Keys Pair
      const keys = await generateKeyPair();
      
      // 2. Save public keys registration configurations to chat-api
      const response = await api.post('/chat/users/profile', {
        username,
        publicKey: keys.publicKey
      });

      const { profile } = response.data;

      // 3. Save Private Key to browser-level memory reference state
      // (This will stay active for the current loaded portal session context)
      window.__cb_chat_private_key = keys.privateKey;

      onAuthComplete(profile, window.__cb_session_token || 'sso-cookie');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to initialize profile keys.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking SSO status
  if (!ssoChecked) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100dvh', 
        background: '#000',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '0.85rem'
      }}>
        Checking session...
      </div>
    );
  }

  return (
    <AuthScreenMobile
      initialStage={initialStage}
      onAuthenticate={handleAuthenticate}
      onCheckUsername={handleCheckUsername}
      onCreateProfile={handleCreateProfile}
      loading={loading}
      error={error}
      clearError={() => setError('')}
      onSSOLogin={handleSSOLogin}
    />
  );
}

