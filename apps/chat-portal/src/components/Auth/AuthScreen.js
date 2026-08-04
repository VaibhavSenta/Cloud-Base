'use client';

import { useState, useEffect } from 'react';
import api, { securePost } from '@/utils/api';
import { useRSA } from '@/hooks/useRSA';
import { config } from '@/utils/config';
import LoginBox from './LoginBox/LoginBox';
import UsernameBox from './UsernameBox/UsernameBox';
import StarryBackground from '@/components/UI/StarryBackground/StarryBackground';
import LoadingScreen from '@/components/UI/LoadingScreen/LoadingScreen';

/**
 * AuthScreen — Handles SSO login via account.cloudbase.local and username creation.
 */
export default function AuthScreen({ onAuthComplete }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ssoChecked, setSsoChecked] = useState(false);
  const [stage, setStage] = useState('auth'); // 'auth' | 'username'
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
            if (isMounted) setStage('username');
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

  // SSO Login: Redirect to account.cloudbase.local for centralized login
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
      // Register username profile in chat-api
      const response = await api.post('/chat/users/profile', {
        username
      });

      const { profile } = response.data;

      onAuthComplete(profile, window.__cb_session_token || 'sso-cookie');
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
