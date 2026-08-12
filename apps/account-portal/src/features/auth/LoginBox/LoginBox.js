/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSecureQueryClient } from '@/hooks/useSecureQuery';
import useWindowSize from '@/hooks/useWindowSize';
import BloomFilter from '@/utils/bloomFilter';
import api, { securePost } from '@/utils/api'; 
import LoginBoxDesktop from './Desktop/LoginBoxDesktop';
import LoginBoxTablet from './Tablet/LoginBoxTablet';
import LoginBoxMobile from './Mobile/LoginBoxMobile';
import ReactivationModal from './ReactivationModal';

const LoginBox = ({ onAuthSuccess, forceWidth }) => {
  const queryClient = useSecureQueryClient();
  const { width: windowWidth } = useWindowSize();
  const width = forceWidth || windowWidth;
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({ identifier: '', password: '', otp: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isPartial, setIsPartial] = useState(false);
  const [error, setError] = useState(null);

  // Two-Factor Authentication state
  const [twoFactorRequired, setTwoFactorRequired] = useState(false);
  const [twoFactorData, setTwoFactorData] = useState(null);
  const [selected2faMethod, setSelected2faMethod] = useState('email');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [twoFactorError, setTwoFactorError] = useState(null);

  // Reactivation state
  const [reactivationRequired, setReactivationRequired] = useState(false);
  const [reactivationData, setReactivationData] = useState(null);

  const partialFilter = useMemo(() => {
    const bf = new BloomFilter(500, 3);
    ['partial@cloudbase.com', 'guest@test.com', 'vaibhav@test.com'].forEach(email => bf.add(email));
    return bf;
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendStatus, setResendStatus] = useState(null); // 'sending', 'success', 'error'

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(prev => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);

    if (name === 'identifier') {
      if (partialFilter.has(value.toLowerCase())) {
        setIsPartial(true);
      } else {
        setIsPartial(false);
      }
    }

    if (name === 'otp' && value.length === 6 && isPartial) {
      handleAutoSubmit(value);
    }
  };

  const handleAutoSubmit = async (otpValue) => {
    setIsLoading(true);
    setError(null);
    try {
        const response = await securePost('/auth/login', {
            identifier: formData.identifier,
            otp: otpValue,
            isPartial: true
        });

        if (response.data.success) {
            // Update React Query Cache securely immediately
            queryClient.setSecureQueryData(['user'], response.data.data.user);
            queryClient.invalidateQueries({ queryKey: ['user'] });
            if (onAuthSuccess) onAuthSuccess(response.data.data.user);
        }
    } catch (err) {
        setError({ field: 'otp', message: 'Invalid verification code' });
    } finally {
        setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        const response = await securePost('/auth/login', {
            ...formData,
            isPartial
        });

        if (response.data.success) {
            if (response.data.twoFactorRequired) {
                setTwoFactorData(response.data.data);
                setSelected2faMethod(response.data.data.primaryMethod || 'email');
                setTwoFactorRequired(true);
                setTwoFactorCode('');
                setTwoFactorError(null);
            } else if (response.data.data && response.data.data.requiresReactivation) {
                setReactivationData({
                    email: formData.identifier,
                    password: formData.password,
                    deletionDate: response.data.data.deletionDate
                });
                setReactivationRequired(true);
            } else if (isPartial) {
                alert("Verification Code Sent!");
            } else {
                // Update React Query Cache securely immediately
                queryClient.setSecureQueryData(['user'], response.data.data.user);
                queryClient.invalidateQueries({ queryKey: ['user'] });
                if (onAuthSuccess) onAuthSuccess(response.data.data.user);
            }
        }
    } catch (err) {
        setError({ 
            field: 'general', 
            message: err.response?.data?.message || 'Login failed. Please try again.' 
        });
    } finally {
        setIsLoading(false);
    }
  };

  const handleVerify2FA = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setTwoFactorError(null);

    try {
      const response = await api.post('/auth/login/verify-2fa', {
        ticket: twoFactorData?.ticket,
        code: twoFactorCode,
        method: selected2faMethod
      });

      if (response.data.success) {
        queryClient.setSecureQueryData(['user'], response.data.data.user);
        queryClient.invalidateQueries({ queryKey: ['user'] });
        if (onAuthSuccess) onAuthSuccess(response.data.data.user);
      }
    } catch (err) {
      setTwoFactorError(err.response?.data?.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel2FA = () => {
    setTwoFactorRequired(false);
    setTwoFactorData(null);
    setTwoFactorCode('');
    setTwoFactorError(null);
    setResendCooldown(0);
    setResendStatus(null);
  };

  const handleResend2FA = async () => {
    if (resendCooldown > 0) return;
    setResendStatus('sending');
    try {
      await api.post('/auth/login/resend-2fa', {
        ticket: twoFactorData?.ticket,
        method: selected2faMethod
      });
      setResendStatus('success');
      setResendCooldown(30); // 30s cooldown
      setTimeout(() => setResendStatus(null), 3000);
    } catch (err) {
      setResendStatus('error');
      setTwoFactorError(err.response?.data?.message || 'Failed to resend verification code');
      setTimeout(() => setResendStatus(null), 3000);
    }
  };

  useEffect(() => {
    if (
      twoFactorRequired && 
      selected2faMethod === 'email' && 
      twoFactorData?.primaryMethod === 'authenticator' &&
      twoFactorData?.ticket
    ) {
      handleResend2FA();
    }
  }, [selected2faMethod, twoFactorRequired, twoFactorData]);

  const handleConfirmReactivation = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.post('/auth/reactivate', {
        email: reactivationData.email,
        password: reactivationData.password
      });
      if (response.data.success) {
        setReactivationRequired(false);
        setReactivationData(null);
        // Update React Query Cache securely immediately
        queryClient.setSecureQueryData(['user'], response.data.data.user);
        queryClient.invalidateQueries({ queryKey: ['user'] });
        if (onAuthSuccess) onAuthSuccess(response.data.data.user);
      }
    } catch (err) {
      setError({
        field: 'general',
        message: err.response?.data?.message || 'Failed to reactivate account.'
      });
      setReactivationRequired(false);
      setReactivationData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReactivation = () => {
    setReactivationRequired(false);
    setReactivationData(null);
  };

  const handleSocialLogin = async (provider, token, clientData) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await securePost('/auth/social-login', {
        provider,
        token,
        clientData
      });
      if (response.data.success) {
        queryClient.setSecureQueryData(['user'], response.data.data.user);
        queryClient.invalidateQueries({ queryKey: ['user'] });
        if (onAuthSuccess) onAuthSuccess(response.data.data.user);
      }
    } catch (err) {
      setError({
        field: 'general',
        message: err.response?.data?.message || 'Social authentication failed.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const SHOW_SOCIAL_AUTH = false;

  const commonProps = {
    formData,
    isPartial,
    onChange: handleChange,
    onSubmit: handleSubmit,
    onSocialLogin: handleSocialLogin,
    showSocialAuth: SHOW_SOCIAL_AUTH,
    isLoading,
    error,
    twoFactorRequired,
    twoFactorData,
    selected2faMethod,
    setSelected2faMethod,
    twoFactorCode,
    setTwoFactorCode,
    twoFactorError,
    onVerify2FA: handleVerify2FA,
    onCancel2FA: handleCancel2FA,
    onResend2FA: handleResend2FA,
    resendCooldown,
    resendStatus
  };

  if (!mounted) {
    return <div style={{ background: 'var(--bg-primary)', minHeight: '100dvh', width: '100%' }}></div>;
  }

  return (
    <>
      {width >= 1024 ? (
        <LoginBoxDesktop {...commonProps} />
      ) : width >= 600 ? (
        <LoginBoxTablet {...commonProps} />
      ) : (
        <LoginBoxMobile {...commonProps} />
      )}
      
      <ReactivationModal 
        isOpen={reactivationRequired}
        deletionDate={reactivationData?.deletionDate}
        onReactivate={handleConfirmReactivation}
        onCancel={handleCancelReactivation}
        isLoading={isLoading}
      />
    </>
  );
};

export default LoginBox;
