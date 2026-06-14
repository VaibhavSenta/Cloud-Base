'use client';
import { useState, useEffect, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useWindowSize from '../../hooks/useWindowSize';
import BloomFilter from '../../utils/bloomFilter';
import api, { securePost } from '../../utils/api'; 
import LoginBoxDesktop from './Desktop/LoginBoxDesktop';
import LoginBoxTablet from './Tablet/LoginBoxTablet';
import LoginBoxMobile from './Mobile/LoginBoxMobile';

const LoginBox = ({ onAuthSuccess }) => {
  const queryClient = useQueryClient();
  const { width } = useWindowSize();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({ identifier: '', password: '', otp: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isPartial, setIsPartial] = useState(false);
  const [error, setError] = useState(null);

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
            // Update React Query Cache immediately
            queryClient.setQueryData(['user'], response.data.data.user);
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
            if (isPartial) {
                alert("Verification Code Sent!");
            } else {
                // Update React Query Cache immediately
                queryClient.setQueryData(['user'], response.data.data.user);
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

  const commonProps = {
    formData,
    isPartial,
    onChange: handleChange,
    onSubmit: handleSubmit,
    isLoading,
    error
  };

  if (!mounted) {
    return <div style={{ background: 'var(--bg-primary)', minHeight: '100dvh', width: '100%' }}></div>;
  }

  if (width >= 1024) return <LoginBoxDesktop {...commonProps} />;
  if (width >= 600 && width < 1024) return <LoginBoxTablet {...commonProps} />;
  
  return <LoginBoxMobile {...commonProps} />;
};

export default LoginBox;
