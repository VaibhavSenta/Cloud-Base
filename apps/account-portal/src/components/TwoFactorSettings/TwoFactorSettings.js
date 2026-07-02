'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSecureQuery } from '../../hooks/useSecureQuery';
import api from '../../utils/api';
import useWindowSize from '../../hooks/useWindowSize';
import TwoFactorSettingsMobile from './Mobile/TwoFactorSettingsMobile';
import TwoFactorSettingsTablet from './Tablet/TwoFactorSettingsTablet';
import TwoFactorSettingsDesktop from './Desktop/TwoFactorSettingsDesktop';

/**
 * Two-Factor Settings Container Component
 * Handles all state, mutations, and business logic for platform layouts.
 */
const TwoFactorSettings = () => {
  const { width } = useWindowSize();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [formVal, setFormVal] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [infoModalData, setInfoModalData] = useState(null);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [successOverlayText, setSuccessOverlayText] = useState('');
  const [authenticatorSetupData, setAuthenticatorSetupData] = useState(null);
  const [authenticatorCode, setAuthenticatorCode] = useState('');

  const triggerSuccessHUD = (text) => {
    setSuccessOverlayText(text);
    setShowSuccessOverlay(true);
    setTimeout(() => {
      setShowSuccessOverlay(false);
    }, 1500);
  };

  // Fetch current user
  const { data: user, isLoading } = useSecureQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data;
    }
  });

  // Load user data on mount / change
  useEffect(() => {
    if (user) {
      setFormVal({
        twoFactorEnabled: user.isEmailVerified,
        'twoFactorMethods.email': true,
        'twoFactorMethods.authenticator': user.twoFactorMethods?.authenticator ?? false,
        twoFactorPrimary: user.twoFactorPrimary ?? 'email'
      });
    }
  }, [user]);

  const update2faSettingsMutation = useMutation({
    mutationFn: async (settings) => {
      const res = await api.patch('/auth/2fa/settings', settings);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], (old) => ({ ...old, ...data.data }));
      triggerSuccessHUD('Saved');
      setErrorMessage('');
    },
    onError: (err) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update settings');
    }
  });

  const setupAuthenticatorMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/2fa/authenticator/setup');
      return res.data;
    },
    onSuccess: (res) => {
      setAuthenticatorSetupData(res.data);
    },
    onError: (err) => {
      setErrorMessage(err.response?.data?.message || 'Failed to initiate authenticator setup');
    }
  });

  const verifyAuthenticatorMutation = useMutation({
    mutationFn: async (code) => {
      const res = await api.post('/auth/2fa/authenticator/verify', { code });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setAuthenticatorSetupData(null);
      setAuthenticatorCode('');
      setFormVal(prev => ({
        ...prev,
        'twoFactorMethods.authenticator': true
      }));
      triggerSuccessHUD('Linked');
    },
    onError: (err) => {
      setErrorMessage(err.response?.data?.message || 'Invalid verification code');
    }
  });

  const handleAutoSave = (updatedFields) => {
    setErrorMessage('');

    const emailVal = true;
    const authVal = updatedFields.authenticator !== undefined 
      ? updatedFields.authenticator 
      : formVal['twoFactorMethods.authenticator'];
    
    let primaryVal = updatedFields.primary !== undefined 
      ? updatedFields.primary 
      : formVal.twoFactorPrimary;

    if (!authVal && primaryVal === 'authenticator') {
      primaryVal = 'email';
      setFormVal(prev => ({ ...prev, twoFactorPrimary: 'email' }));
    }

    update2faSettingsMutation.mutate({
      twoFactorEnabled: true,
      twoFactorMethods: {
        email: emailVal,
        authenticator: authVal
      },
      twoFactorPrimary: primaryVal
    });
  };

  const sharedProps = {
    user,
    formVal,
    setFormVal,
    errorMessage,
    setErrorMessage,
    infoModalData,
    setInfoModalData,
    showSuccessOverlay,
    successOverlayText,
    authenticatorSetupData,
    setAuthenticatorSetupData,
    authenticatorCode,
    setAuthenticatorCode,
    setupAuthenticatorMutation,
    verifyAuthenticatorMutation,
    handleAutoSave,
    router
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px', 
        color: '#888888', 
        fontSize: '0.85rem' 
      }}>
        Loading security configurations...
      </div>
    );
  }

  // SSR/hydration fallback to mobile layout
  if (width === undefined) {
    return <TwoFactorSettingsMobile {...sharedProps} />;
  }

  if (width >= 1024) {
    return <TwoFactorSettingsDesktop {...sharedProps} />;
  }

  if (width >= 768) {
    return <TwoFactorSettingsTablet {...sharedProps} />;
  }

  return <TwoFactorSettingsMobile {...sharedProps} />;
};

export default TwoFactorSettings;
