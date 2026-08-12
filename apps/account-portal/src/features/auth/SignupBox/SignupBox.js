/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSecureQueryClient } from '@/hooks/useSecureQuery';
import useWindowSize from '@/hooks/useWindowSize';
import api, { securePost } from '@/utils/api';
import SignupBoxDesktop from './Desktop/SignupBoxDesktop';
import SignupBoxTablet from './Tablet/SignupBoxTablet';
import SignupBoxMobile from './Mobile/SignupBoxMobile';

const SignupBox = ({ onAuthSuccess }) => {
  const queryClient = useSecureQueryClient();
  const { width } = useWindowSize();
  const [mounted, setMounted] = useState(false);
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ 
    firstName: '', 
    lastName: '',
    username: '', 
    email: '', 
    password: '' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const takenUsernames = ['admin', 'bella', 'cloudbase', 'test'];

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const nextStep = async () => {
    setIsLoading(true);
    setError(null);

    if (step === 1) {
      if (!formData.username) {
        setError({ field: 'username', message: 'Username is required' });
        setIsLoading(false);
        return;
      }
      await new Promise(r => setTimeout(r, 600));
      if (takenUsernames.includes(formData.username.toLowerCase())) {
        setError({ field: 'username', message: 'This username is already taken' });
        setIsLoading(false);
        return;
      }
    }

    if (step === 2) {
      if (!formData.email || !formData.email.includes('@')) {
        setError({ field: 'email', message: 'Please enter a valid email' });
        setIsLoading(false);
        return;
      }
      if (mode === 'partial') {
        await handleSubmit();
        return;
      }
    }

    if (step === 3) {
      if (!formData.firstName) {
        setError({ field: 'firstName', message: 'First name is required' });
        setIsLoading(false);
        return;
      }
    }

    if (step === 4) {
        await handleSubmit();
        return;
    }

    setStep(prev => prev + 1);
    setIsLoading(false);
  };

  const prevStep = () => {
    if (step > 1) setStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
        const response = await securePost('/auth/signup', {
            ...formData,
            username: formData.username,
            isPartial: mode === 'partial'
        });

        if (response.data.success) {
            // Update React Query Cache securely immediately
            queryClient.setSecureQueryData(['user'], response.data.data.user);
            if (onAuthSuccess) onAuthSuccess(response.data.data.user);
        }
    } catch (err) {
        console.warn("Signup Error:", err.message);
        setError({ 
            field: err.response?.data?.field || 'general', 
            message: err.response?.data?.message || 'Something went wrong.' 
        });
    } finally {
        setIsLoading(false);
    }
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
    step,
    nextStep,
    prevStep,
    onChange: handleChange,
    onSubmit: handleSubmit,
    onSocialLogin: handleSocialLogin,
    showSocialAuth: SHOW_SOCIAL_AUTH,
    isLoading,
    error,
    isPartial: mode === 'partial'
  };

  if (!mounted) {
    return <div style={{ background: 'var(--bg-primary)', minHeight: '100dvh', width: '100%' }}></div>;
  }

  if (width >= 1024) return <SignupBoxDesktop {...commonProps} />;
  if (width >= 600 && width < 1024) return <SignupBoxTablet {...commonProps} />;
  
  return <SignupBoxMobile {...commonProps} />;
};

export default SignupBox;
