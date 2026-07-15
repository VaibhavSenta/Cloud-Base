'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useSecureQuery, useSecureQueryClient } from '../../../hooks/useSecureQuery';
import api from '../../../utils/api';
import { encryptPayload } from '../../../utils/security/networkCrypto';
import { auth } from '../../../utils/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import {
  IdentityVerificationCard,
  PasswordHubCard,
  MultifactorAuthCard,
  RecentActivityCard,
  DangerZoneCard
} from '../UI/BentoCards/BentoCards';
import SecuritySettingsModal from '../UI/SecuritySettingsModal/SecuritySettingsModal';
import styles from './SecuritySettingsDesktop.module.css';

/**
 * Premium Bento-Grid Desktop view for Signin & Security Page
 */
export default function SecuritySettingsDesktop() {
  const queryClient = useSecureQueryClient();
  const router = useRouter();
  const [editField, setEditField] = useState(null); // 'email', 'phone', '2fa', 'deactivate', 'delete'
  const [formVal, setFormVal] = useState({});
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isVerifyRequestSent, setIsVerifyRequestSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [isSmsSending, setIsSmsSending] = useState(false);
  const [isSupportSubmitted, setIsSupportSubmitted] = useState(false);
  const [authenticatorSetupData, setAuthenticatorSetupData] = useState(null);
  const [authenticatorCode, setAuthenticatorCode] = useState('');

  // Fetch current user from React Query cache
  const { data: user, isLoading } = useSecureQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data;
    }
  });

  // Mutation to handle backend profile updates
  const updateMutation = useMutation({
    mutationFn: async (updatedData) => {
      const encryptedBody = await encryptPayload(updatedData);
      const res = await api.patch('/auth/profile', encryptedBody);
      return res.data.data;
    },
    onSuccess: (data) => {
      queryClient.setSecureQueryData(['user'], (old) => {
        if (!old) return data;
        return { ...old, ...data };
      });
      handleCloseModal();
    },
    onError: (err) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update credentials');
    }
  });

  const verifyRequestMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/auth/verify-email/request');
      return res.data;
    },
    onSuccess: () => {
      setIsVerifyRequestSent(true);
    },
    onError: (err) => {
      setErrorMessage(err.response?.data?.message || 'Failed to send verification link');
    }
  });

  const changeEmailMutation = useMutation({
    mutationFn: async (newEmail) => {
      const res = await api.post('/change-email/request', { newEmail });
      return res.data;
    },
    onSuccess: () => {
      setIsVerifyRequestSent(true);
    },
    onError: (err) => {
      setErrorMessage(err.response?.data?.message || 'Failed to request email change');
    }
  });

  const update2faSettingsMutation = useMutation({
    mutationFn: async (settings) => {
      const res = await api.patch('/2fa/settings', settings);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.setSecureQueryData(['user'], (old) => ({ ...old, ...data.data }));
      handleCloseModal();
    },
    onError: (err) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update 2FA settings');
    }
  });

  const deactivateMutation = useMutation({
    mutationFn: async (password) => {
      const encryptedBody = await encryptPayload({ password });
      const res = await api.post('/auth/deactivate', encryptedBody);
      return res.data;
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/';
    },
    onError: (err) => {
      setErrorMessage(err.response?.data?.message || 'Failed to deactivate account');
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (password) => {
      const encryptedBody = await encryptPayload({ password });
      const res = await api.post('/auth/delete', encryptedBody);
      return res.data;
    },
    onSuccess: () => {
      queryClient.clear();
      window.location.href = '/';
    },
    onError: (err) => {
      setErrorMessage(err.response?.data?.message || 'Failed to schedule account deletion');
    }
  });

  const setupAuthenticatorMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/2fa/authenticator/setup');
      return res.data;
    },
    onSuccess: (res) => {
      setAuthenticatorSetupData(res.data);
    },
    onError: (err) => {
      setErrorMessage(err.response?.data?.message || 'Failed to initialize authenticator setup');
    }
  });

  const verifyAuthenticatorMutation = useMutation({
    mutationFn: async (code) => {
      const res = await api.post('/2fa/authenticator/verify', { code });
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
    },
    onError: (err) => {
      setErrorMessage(err.response?.data?.message || 'Invalid verification code');
    }
  });

  const handleEditClick = useCallback((field) => {
    setEditField(field);
    setErrorMessage('');
    setIsOtpSent(false);
    
    if (field === 'email') {
      setFormVal({ newEmail: '' });
    } else if (field === 'phone') {
      setFormVal({ phonenumber: user?.phonenumber || '', otpCode: '' });
    } else if (field === '2fa') {
      setFormVal({
        twoFactorEnabled: user?.twoFactorEnabled ?? false,
        'twoFactorMethods.email': user?.twoFactorMethods?.email ?? true,
        'twoFactorMethods.authenticator': user?.twoFactorMethods?.authenticator ?? false,
        twoFactorPrimary: user?.twoFactorPrimary ?? 'email'
      });
      setAuthenticatorSetupData(null);
      setAuthenticatorCode('');
    } else if (field === 'deactivate' || field === 'delete') {
      setFormVal({ password: '', otpCode: '', confirmText: '' });
    }
  }, [user]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormVal(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleCloseModal = useCallback(() => {
    setEditField(null);
    setFormVal({});
    setIsOtpSent(false);
    setErrorMessage('');
    setIsVerifyRequestSent(false);
    setIsSupportSubmitted(false);
    setAuthenticatorSetupData(null);
    setAuthenticatorCode('');
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    if (editField === 'email') {
      if (!user.isEmailVerified) {
        verifyRequestMutation.mutate();
      } else {
        if (!formVal.newEmail) {
          setErrorMessage('Please enter a valid email address');
          return;
        }
        changeEmailMutation.mutate(formVal.newEmail);
      }
    } 
    
    else if (editField === 'phone') {
      if (!isOtpSent) {
        if (!formVal.phonenumberRaw) {
          setErrorMessage('Please enter a valid phone number');
          return;
        }
        
        const countryCode = formVal.countryCode || '+91';
        const cleanedRaw = formVal.phonenumberRaw.replace(/\D/g, '').replace(/^0+/, '');
        const fullPhone = countryCode + cleanedRaw;

        setIsSmsSending(true);
        setErrorMessage('');
        
        try {
          if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
              size: 'invisible'
            });
          }
          
          signInWithPhoneNumber(auth, fullPhone, window.recaptchaVerifier)
            .then((result) => {
              setConfirmationResult(result);
              setFormVal(prev => ({ ...prev, fullPhone }));
              setIsOtpSent(true);
              setIsSmsSending(false);
            })
            .catch((err) => {
              setIsSmsSending(false);
              if (err.code === 'auth/operation-not-allowed' || err.message.toLowerCase().includes('region')) {
                setErrorMessage('UNSUPPORTED_REGION');
              } else {
                setErrorMessage(err.message || 'Failed to send verification SMS');
              }
            });
        } catch (err) {
          setIsSmsSending(false);
          setErrorMessage(err.message || 'reCAPTCHA initialization failed');
        }
      } else {
        if (!formVal.otpCode) {
          setErrorMessage('Please enter the 6-digit verification code');
          return;
        }
        setIsSmsSending(true);
        setErrorMessage('');

        confirmationResult.confirm(formVal.otpCode)
          .then(async (result) => {
            const token = await result.user.getIdToken();
            updateMutation.mutate({
              phonenumber: formVal.fullPhone,
              firebaseToken: token
            });
            setIsSmsSending(false);
          })
          .catch((err) => {
            setIsSmsSending(false);
            setErrorMessage('Invalid verification code. Please check and try again.');
          });
      }
    } 

    else if (editField === '2fa') {
      update2faSettingsMutation.mutate({
        twoFactorEnabled: formVal.twoFactorEnabled,
        twoFactorMethods: {
          email: formVal['twoFactorMethods.email'],
          authenticator: formVal['twoFactorMethods.authenticator']
        },
        twoFactorPrimary: formVal.twoFactorPrimary
      });
    }

    else if (editField === 'deactivate') {
      if (!formVal.password) {
        setErrorMessage('Password is required');
        return;
      }
      if (!formVal.confirmText || formVal.confirmText.toLowerCase() !== 'deactivate') {
        setErrorMessage('Please type deactivate to confirm');
        return;
      }
      deactivateMutation.mutate(formVal.password);
    }

    else if (editField === 'delete') {
      if (!formVal.password) {
        setErrorMessage('Password is required');
        return;
      }
      if (!formVal.confirmText || formVal.confirmText.toLowerCase() !== 'delete') {
        setErrorMessage('Please type delete to confirm');
        return;
      }
      deleteMutation.mutate(formVal.password);
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading credentials...</div>;
  }

  const isPending =
    updateMutation.isPending ||
    verifyRequestMutation.isPending ||
    changeEmailMutation.isPending ||
    update2faSettingsMutation.isPending ||
    deactivateMutation.isPending ||
    deleteMutation.isPending ||
    isSmsSending;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerTitleArea}>
          <h1 className={styles.title}>Signin & Security</h1>
          <div className={styles.securityStatus}>
            <div className={styles.statusDotActive}></div>
            <span className={styles.statusTitle}>Shield Active</span>
          </div>
        </div>
        <p className={styles.subtitle}>Protect your account credentials, encryption standards, and active login sessions.</p>
      </header>

      {/* 🍱 Premium Bento Grid Layout */}
      <div className={styles.bentoGrid}>
        <IdentityVerificationCard user={user} onEditClick={handleEditClick} />
        <PasswordHubCard onManageClick={() => router.push('/dashboard/security/password')} />
        <MultifactorAuthCard user={user} onConfigureClick={handleEditClick} />
        <RecentActivityCard onViewClick={() => router.push('/dashboard/security/devices')} />
        <DangerZoneCard
          onDeactivateClick={() => handleEditClick('deactivate')}
          onDeleteClick={() => handleEditClick('delete')}
        />
      </div>

      {/* 🖥️ Centered Modal Dialog */}
      <SecuritySettingsModal
        isOpen={!!editField}
        editField={editField}
        user={user}
        formVal={formVal}
        handleInputChange={handleInputChange}
        isOtpSent={isOtpSent}
        authenticatorSetupData={authenticatorSetupData}
        authenticatorCode={authenticatorCode}
        setAuthenticatorCode={setAuthenticatorCode}
        verifyAuthenticatorMutation={verifyAuthenticatorMutation}
        setupAuthenticatorMutation={setupAuthenticatorMutation}
        isSupportSubmitted={isSupportSubmitted}
        setIsSupportSubmitted={setIsSupportSubmitted}
        errorMessage={errorMessage}
        setErrorMessage={setErrorMessage}
        setFormVal={setFormVal}
        isPending={isPending}
        isVerifyRequestSent={isVerifyRequestSent}
        handleCloseModal={handleCloseModal}
        handleSubmit={handleSubmit}
      />

      {/* 🤖 Invisible reCAPTCHA Anchor */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
