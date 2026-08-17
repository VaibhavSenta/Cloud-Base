/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import { useState, useEffect } from 'react';
import api, { securePost } from '@/utils/api';
import { useRSA } from '@/hooks/useRSA';
import { config } from '@/utils/config';
import LoginBox from './LoginBox/LoginBox';
import UsernameBox from './UsernameBox/UsernameBox';
import UnlockBox from './UnlockBox/UnlockBox';
import StarryBackground from '@/components/UI/StarryBackground/StarryBackground';
import LoadingScreen from '@/components/UI/LoadingScreen/LoadingScreen';
import { deriveMasterKey, encryptPrivateKey, decryptPrivateKey } from '@/utils/security/passwordVault';

/**
 * AuthScreen — Handles SSO login via centralized account portal and username creation.
 */
export default function AuthScreen({ onAuthComplete }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ssoChecked, setSsoChecked] = useState(false);
  const [stage, setStage] = useState('auth'); // 'auth' | 'username' | 'unlock'
  const [tempProfile, setTempProfile] = useState(null);
  const { generateKeyPair } = useRSA();

  useEffect(() => {
    let isMounted = true;
    const checkExistingAuth = async () => {
      try {
        console.log('📡 SSO: Initiating /auth/me API call with 5s timeout...');
        const meResponse = await api.get('/auth/me', { timeout: 5000 });
        console.log('📡 SSO: /auth/me response received:', meResponse.status);
        
        if (meResponse.data?.success && meResponse.data?.data) {
          console.log('🔑 SSO: User already authenticated via shared cookie.');
          try {
            console.log('📡 SSO: Fetching chat profile with 5s timeout...');
            const profileResponse = await api.get('/chat/users/profile', { timeout: 5000 });
            console.log('📡 SSO: Chat profile fetched successfully.');
            
            if (profileResponse.data?.profile) {
              const profile = profileResponse.data.profile;
              const ssoUser = meResponse.data.data;
              console.log('🔑 SSO: Chat profile active. Bypassing security checks.');
              onAuthComplete({
                ...profile,
                firstName: ssoUser.firstName || ssoUser.username || '',
                lastName: ssoUser.lastName || '',
                email: ssoUser.email || ''
              }, 'sso-cookie');
              return;
            }
          } catch (profileErr) {
            console.error('🔑 Profile lookup failed:', profileErr);
            if (isMounted) setStage('username');
          }
        }
      } catch (err) {
        console.warn('🔓 SSO: No active session found. Rendering Login UI.', err);
      } finally {
        console.log('🏁 SSO Check Complete. Setting state to unblock loading screen.');
        setSsoChecked(true);
        setLoading(false);
      }
    };

    checkExistingAuth();
    return () => { isMounted = false; };
  }, [onAuthComplete]);

  // SSO Login: Redirect to centralized account portal for login
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

      const { token } = response.data;
      if (!token) throw new Error('Token verification parameters missing.');

      window.__cb_session_token = token;
      setLoading(false);
      setStage('username');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Signup failed.');
      setLoading(false);
      return false;
    }
  };

  const handleAuthenticate = async (isLogin, email, password) => {
    if (isLogin) {
      handleSSOLogin();
      return false;
    } else {
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
      // Fetch SSO user details first to populate display fields
      let ssoUser = {};
      try {
        const meResponse = await api.get('/auth/me', { timeout: 5000 });
        ssoUser = meResponse.data?.data || {};
      } catch (meErr) {
        console.warn('⚠️ Could not fetch SSO info during profile creation:', meErr.message);
      }

      // Register username profile in chat-api (skip keys for plaintext mode)
      const response = await api.post('/chat/users/profile', {
        username,
        publicKey: '',
        encryptedPrivateKey: ''
      });

      const { profile } = response.data;

      onAuthComplete({
        ...profile,
        firstName: ssoUser.firstName || ssoUser.username || '',
        lastName: ssoUser.lastName || '',
        email: ssoUser.email || ''
      }, window.__cb_session_token || 'sso-cookie');
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to create profile.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking SSO status
  if (!ssoChecked) {
    return <LoadingScreen message="Checking session" />;
  }

  return (
    <>
      <StarryBackground />
      {stage === 'username' ? (
        <UsernameBox
          onCheckUsername={handleCheckUsername}
          onCreateProfile={handleCreateProfile}
          loading={loading}
          error={error}
        />
      ) : (
        <LoginBox
          onSSOLogin={handleSSOLogin}
          onAuthenticate={handleAuthenticate}
          loading={loading}
          error={error}
          clearError={() => setError('')}
        />
      )}
    </>
  );
}
