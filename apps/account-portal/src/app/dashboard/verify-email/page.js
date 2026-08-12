/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import api from '../../../utils/api';
import { useSecureQueryClient } from '../../../hooks/useSecureQuery';
import styles from './VerifyEmail.module.css';

/**
 * Child Component utilizing useSearchParams()
 */
function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useSecureQueryClient();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
  const [errorMsg, setErrorMsg] = useState('');

  const confirmMutation = useMutation({
    mutationFn: async (verifyToken) => {
      const res = await api.post('/auth/verify-email/confirm', { token: verifyToken });
      return res.data;
    },
    onSuccess: (data) => {
      setStatus('success');
      // Update local react query user cache
      queryClient.setSecureQueryData(['user'], (old) => {
        if (!old) return old;
        return { ...old, isEmailVerified: true };
      });
      // Redirect back to dashboard security after 3 seconds
      setTimeout(() => {
        router.push('/dashboard/security');
      }, 3000);
    },
    onError: (err) => {
      setStatus('error');
      setErrorMsg(err.response?.data?.message || 'Verification token is invalid or has expired.');
    }
  });

  useEffect(() => {
    if (token) {
      confirmMutation.mutate(token);
    } else {
      setStatus('error');
      setErrorMsg('No verification token provided in URL.');
    }
  }, [token]);

  return (
    <div className={styles.verifyCard}>
      {status === 'verifying' && (
        <div className={styles.loaderContainer}>
          <div className={styles.customLoader}></div>
          <h2 className={styles.title}>Verifying Email</h2>
          <p className={styles.subtitle}>Connecting to Nothing Box secure network...</p>
        </div>
      )}

      {status === 'success' && (
        <div className={styles.successContainer}>
          <div className={styles.successMarker}>✓</div>
          <h2 className={styles.title}>Email Verified</h2>
          <p className={styles.subtitle}>Your account credentials have been successfully updated.</p>
          <p className={styles.redirectHint}>Redirecting to security settings in 3s...</p>
        </div>
      )}

      {status === 'error' && (
        <div className={styles.errorContainer}>
          <div className={styles.errorMarker}>✕</div>
          <h2 className={styles.title}>Verification Failed</h2>
          <p className={styles.subtitle}>{errorMsg}</p>
          <button 
            onClick={() => router.push('/dashboard/security')} 
            className={styles.actionBtn}
          >
            Request New Link
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Main Page Export wrapped in Suspense
 */
export default function VerifyEmailPage() {
  return (
    <div className={styles.container}>
      <Suspense fallback={
        <div className={styles.verifyCard}>
          <div className={styles.loaderContainer}>
            <div className={styles.customLoader}></div>
            <h2 className={styles.title}>Verifying Email</h2>
            <p className={styles.subtitle}>Loading verification components...</p>
          </div>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
