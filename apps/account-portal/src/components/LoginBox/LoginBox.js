'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSecureQueryClient } from '../../hooks/useSecureQuery';
import useWindowSize from '../../hooks/useWindowSize';
import BloomFilter from '../../utils/bloomFilter';
import api, { securePost } from '../../utils/api'; 
import LoginBoxDesktop from './Desktop/LoginBoxDesktop';
import LoginBoxTablet from './Tablet/LoginBoxTablet';
import LoginBoxMobile from './Mobile/LoginBoxMobile';

const LoginBox = ({ onAuthSuccess }) => {
  const queryClient = useSecureQueryClient();
  const { width } = useWindowSize();
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

  const partialFilter = useMemo(() => {
    const bf = new BloomFilter(500, 3);
    ['partial@cloudbase.com', 'guest@test.com', 'vaibhav@test.com'].forEach(email => bf.add(email));
    return bf;
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

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
            } else if (isPartial) {
                alert("Verification Code Sent!");
            } else {
                // Update React Query Cache securely immediately
                queryClient.setSecureQueryData(['user'], response.data.data.user);
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
    onCancel2FA: handleCancel2FA
  };

  if (!mounted) {
    return <div style={{ background: 'var(--bg-primary)', minHeight: '100dvh', width: '100%' }}></div>;
  }

  if (width >= 1024) return <LoginBoxDesktop {...commonProps} />;
  if (width >= 600 && width < 1024) return <LoginBoxTablet {...commonProps} />;
  
  return <LoginBoxMobile {...commonProps} />;
};

export default LoginBox;
