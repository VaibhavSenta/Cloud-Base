'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useSecureQuery, useSecureQueryClient } from '../../../hooks/useSecureQuery';
import api from '../../../utils/api';
import { encryptPayload } from '../../../utils/security/networkCrypto';
import BottomSheet from '@/components/UI/BottomSheet/BottomSheet';
import { auth } from '../../../utils/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import SecurityFormFields from '../UI/SecurityFormFields/SecurityFormFields';
import styles from './SecuritySettingsMobile.module.css';

/**
 * Mobile view for Signin & Security Page
 */
export default function SecuritySettingsMobile() {
  const queryClient = useSecureQueryClient();
  const router = useRouter();
  const [editField, setEditField] = useState(null); // 'email', 'phone', 'password', '2fa', 'deactivate', 'delete'
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
      handleCloseBottomSheet();
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
      handleCloseBottomSheet();
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

  const handleEditClick = (field) => {
    setEditField(field);
    setErrorMessage('');
    setIsOtpSent(false);
    
    if (field === 'email') {
      setFormVal({ newEmail: '' });
    } else if (field === 'phone') {
      setFormVal({ phonenumber: user?.phonenumber || '', otpCode: '' });
    } else if (field === 'password') {
      setFormVal({ currentPassword: '', newPassword: '', confirmPassword: '' });
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
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormVal(prev => ({ ...prev, [name]: value }));
  };

  const handleCloseBottomSheet = () => {
    setEditField(null);
    setFormVal({});
    setIsOtpSent(false);
    setErrorMessage('');
    setIsVerifyRequestSent(false);
    setIsSupportSubmitted(false);
    setAuthenticatorSetupData(null);
    setAuthenticatorCode('');
  };

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
      <div className={styles.mobileLayout}>
        {/* Section 1: Verifications */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Verifications</h3>
          <div className={styles.infoList}>
            
            {/* Email Verification Row */}
            <div className={styles.infoItem} onClick={() => handleEditClick('email')}>
              <div className={styles.rowMeta}>
                <span className={styles.infoLabel}>Email Address</span>
                <span className={styles.infoValue}>{user?.email}</span>
              </div>
              <div className={styles.rowControls}>
                {user?.isEmailVerified ? (
                  <span className={styles.badgeGreen}>Verified</span>
                ) : (
                  <span className={styles.badgeRed}>Unverified</span>
                )}
                <span className={styles.editArrow}>›</span>
              </div>
            </div>

            {/* Mobile Number Verification Row */}
            <div className={styles.infoItem} onClick={() => handleEditClick('phone')}>
              <div className={styles.rowMeta}>
                <span className={styles.infoLabel}>Mobile Number</span>
                <span className={styles.infoValue}>{user?.phonenumber || 'Not added to profile'}</span>
              </div>
              <div className={styles.rowControls}>
                {user?.phonenumber ? (
                  <span className={styles.badgeGreen}>Verified</span>
                ) : (
                  <span className={styles.badgeOrange}>Required</span>
                )}
                <span className={styles.editArrow}>›</span>
              </div>
            </div>

          </div>
        </div>

        {/* Section 2: Account Actions */}
        <div className={styles.card}>
          <h3 className={styles.cardTitle}>Account Hub</h3>
          <div className={styles.infoList}>
            
            {/* Password Link */}
            <div className={styles.infoItem} onClick={() => router.push('/dashboard/security/password')}>
              <div className={styles.rowMeta}>
                <span className={styles.infoLabel}>Password Manager</span>
                <span className={styles.infoValue}>Configure reveal secondary rules</span>
              </div>
              <span className={styles.editArrow}>›</span>
            </div>

            {/* 2FA Link */}
            <div className={styles.infoItem} onClick={() => router.push('/dashboard/security/2fa')}>
              <div className={styles.rowMeta}>
                <span className={styles.infoLabel}>Two-Factor Authentication</span>
                <span className={styles.infoValue}>
                  {user?.twoFactorEnabled ? 'Active (Email OTP)' : 'Disabled'}
                </span>
              </div>
              <span className={styles.editArrow}>›</span>
            </div>

          </div>
        </div>

        {/* Section 3: Danger Zone */}
        <div className={`${styles.card} ${styles.cardDanger}`}>
          <h3 className={styles.cardTitleDanger}>Danger Zone Hub</h3>
          <div className={styles.infoList}>
            
            {/* Deactivation */}
            <div className={styles.infoItem} onClick={() => handleEditClick('deactivate')}>
              <div className={styles.rowMeta}>
                <span className={styles.dangerLabel}>Deactivate Account</span>
                <span className={styles.infoValue}>Temporarily lock account access</span>
              </div>
              <span className={styles.editArrow}>›</span>
            </div>

            {/* Permanent Deletion */}
            <div className={styles.infoItem} onClick={() => handleEditClick('delete')}>
              <div className={styles.rowMeta}>
                <span className={styles.dangerLabel}>Delete Account</span>
                <span className={styles.infoValue}>Wipe vaults and wipe databases</span>
              </div>
              <span className={styles.editArrow}>›</span>
            </div>

          </div>
        </div>
      </div>

      {/* 📱 Bottom Sheet Modal Drawer */}
      <BottomSheet
        isOpen={!!editField}
        onClose={handleCloseBottomSheet}
        title={
          editField === 'email' ? 'Email Verification' :
          editField === 'phone' ? 'Phone Setup' :
          editField === '2fa' ? 'Two-Factor Authentication' :
          editField === 'deactivate' ? 'Deactivate Account' :
          editField === 'delete' ? 'Delete Account' : ''
        }
        subtitle={
          editField === 'delete'
            ? 'This action is irreversible. All databases will be wiped.'
            : 'Verify identity to confirm changes.'
        }
        onSubmit={handleSubmit}
        isPending={isPending}
      >
        <SecurityFormFields
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
        />
      </BottomSheet>
      
      {/* 🤖 Invisible reCAPTCHA Anchor */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
