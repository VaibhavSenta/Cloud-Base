'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useSecureQuery, useSecureQueryClient } from '../../../hooks/useSecureQuery';
import api from '../../../utils/api';
import { encryptPayload } from '../../../utils/security/networkCrypto';
import BottomSheet from '../../UI/BottomSheet/BottomSheet';
import styles from './SecuritySettingsMobile.module.css';
import { auth } from '../../../utils/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

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
      queryClient.setQueryData(['user'], (old) => ({ ...old, ...data.data }));
      handleCloseBottomSheet();
    },
    onError: (err) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update 2FA settings');
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
    
    else if (editField === 'password') {
      if (!formVal.currentPassword || !formVal.newPassword) {
        setErrorMessage('All fields are required');
        return;
      }
      if (formVal.newPassword !== formVal.confirmPassword) {
        setErrorMessage('New passwords do not match');
        return;
      }
      alert("Password change request submitted!");
      handleCloseBottomSheet();
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
      if (!isOtpSent) {
        setIsOtpSent(true);
        alert("Deactivation OTP code sent to your email!");
        return;
      }
      if (!formVal.otpCode) {
        setErrorMessage('Please enter the email verification OTP');
        return;
      }
      if (formVal.confirmText.toLowerCase() !== 'deactivate') {
        setErrorMessage('Please type deactivate to confirm');
        return;
      }
      alert("Account deactivated successfully!");
      handleCloseBottomSheet();
    }

    else if (editField === 'delete') {
      if (!formVal.password) {
        setErrorMessage('Password is required');
        return;
      }
      if (!isOtpSent) {
        setIsOtpSent(true);
        alert("Deletion OTP code sent to your email!");
        return;
      }
      if (!formVal.otpCode) {
        setErrorMessage('Please enter the email verification OTP');
        return;
      }
      if (formVal.confirmText.toLowerCase() !== 'delete') {
        setErrorMessage('Please type delete to confirm');
        return;
      }
      alert("Account deleted permanently. Goodbye!");
      handleCloseBottomSheet();
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading credentials...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.securityStatus}>
          <div className={styles.statusDotActive}></div>
          <span className={styles.statusTitle}>Security Shield Active</span>
        </div>
        <p className={styles.subtitle}>Protect your account credentials and active login sessions.</p>
      </header>

      <section className={styles.section}>
        {/* List 1: Basic Identity Credentials */}
        <div className={styles.card}>
          <div className={styles.infoList}>
            {/* Email Setting Row */}
            <div className={styles.infoItem} onClick={() => handleEditClick('email')}>
              <div className={styles.meta}>
                <span className={styles.infoLabel}>Email Address</span>
                <span className={styles.infoValue}>{user?.email}</span>
              </div>
              <div className={styles.rightGroup}>
                {!user?.isEmailVerified && <span className={styles.statusDotRed}></span>}
                <span className={styles.arrow}>›</span>
              </div>
            </div>

            {/* Phone Setting Row */}
            <div className={styles.infoItem} onClick={() => handleEditClick('phone')}>
              <div className={styles.meta}>
                <span className={styles.infoLabel}>Mobile Number</span>
                <span className={styles.infoValue}>{user?.phonenumber || 'Not added'}</span>
              </div>
              <div className={styles.rightGroup}>
                {!user?.phonenumber && <span className={styles.statusDotRed}></span>}
                <span className={styles.arrow}>›</span>
              </div>
            </div>

            {/* Password Setting Row (Redirects to password options page) */}
            <div className={styles.infoItem} onClick={() => router.push('/dashboard/security/password')}>
              <div className={styles.meta}>
                <span className={styles.infoLabel}>Account Password</span>
                <span className={styles.infoValue}>View password options</span>
              </div>
              <div className={styles.rightGroup}>
                <span className={styles.arrow}>›</span>
              </div>
            </div>
          </div>
        </div>

        {/* List 2: Two-Factor Authentication Settings */}
        <div className={styles.card}>
          <div className={styles.infoList}>
            <div className={styles.infoItem} onClick={() => router.push('/dashboard/security/2fa')}>
              <span className={styles.infoLabelSingle}>Two-Factor Authentication</span>
              <div className={styles.rightGroup}>
                <span className={styles.arrow}>›</span>
              </div>
            </div>
          </div>
        </div>

        {/* List 3: Recent Security Activity Link Row */}
        <div className={styles.card}>
          <div className={styles.infoList}>
            <div className={styles.infoItem} onClick={() => alert('Navigating to recent activity...')}>
              <span className={styles.infoLabelSingle}>Recent Activity</span>
              <div className={styles.rightGroup}>
                <span className={styles.arrow}>›</span>
              </div>
            </div>
          </div>
        </div>

        {/* List 4: Danger Zone Settings (Deactivation & Deletion) */}
        <div className={styles.card}>
          <div className={styles.infoList}>
            {/* Deactivation Row */}
            <div className={styles.infoItem} onClick={() => handleEditClick('deactivate')}>
              <span className={styles.infoLabelDanger}>Deactivate Account</span>
              <div className={styles.rightGroup}>
                <span className={styles.arrow}>›</span>
              </div>
            </div>

            {/* Deletion Row */}
            <div className={styles.infoItem} onClick={() => handleEditClick('delete')}>
              <span className={styles.infoLabelDanger}>Delete Account</span>
              <div className={styles.rightGroup}>
                <span className={styles.arrow}>›</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📱 Bottom Sheet Dialog Modal */}
      <BottomSheet
        isOpen={!!editField}
        onClose={handleCloseBottomSheet}
        title={
          editField === 'email' ? 'Email Verification' :
          editField === 'phone' ? 'Phone Setup' :
          editField === 'password' ? 'Update Password' :
          editField === '2fa' ? 'Two-Factor Authentication' :
          editField === 'deactivate' ? 'Deactivate Account' :
          editField === 'delete' ? 'Delete Account' : ''
        }
        subtitle={
          editField === 'email' && !user?.isEmailVerified ? 'Verify ownership of your account email.' :
          editField === 'email' && user?.isEmailVerified ? 'Modify your primary contact and login email.' :
          editField === 'phone' ? 'Verify your phone number using SMS verification.' :
          editField === 'password' ? 'Create a strong, unique password for authentication.' :
          editField === '2fa' ? 'Choose an authentication channel to protect login sessions.' :
          editField === 'deactivate' ? 'Verify identity to temporarily lock your account.' :
          editField === 'delete' ? 'This action is irreversible. All databases will be wiped.' : ''
        }
        onSubmit={handleSubmit}
        submitText={
          update2faSettingsMutation.isPending ? 'Saving...' :
          editField === 'email' && !user?.isEmailVerified ? (
            user?.emailVerificationExpires && new Date(user.emailVerificationExpires) > new Date()
              ? 'Resend Verification Link'
              : 'Send Verification Link'
          ) :
          editField === 'email' && user?.isEmailVerified ? 'Send Verification Link' :
          editField === 'phone' && !isOtpSent ? 'Send Verification SMS' :
          editField === 'phone' && isOtpSent ? 'Verify OTP Code' :
          (editField === 'deactivate' || editField === 'delete') && !isOtpSent ? 'Send Email OTP' :
          editField === 'deactivate' ? 'Confirm Deactivation' :
          editField === 'delete' ? 'Confirm Permanent Deletion' :
          'Save Changes'
        }
        pendingText={isSmsSending ? 'Processing...' : 'Sending Link...'}
        isPending={updateMutation.isPending || verifyRequestMutation.isPending || changeEmailMutation.isPending || isSmsSending || update2faSettingsMutation.isPending || setupAuthenticatorMutation.isPending}
        showActions={!isVerifyRequestSent}
      >
        {isVerifyRequestSent ? (
          <div className={styles.successWrapper}>
            <div className={styles.successIcon}>✓</div>
            <h4 className={styles.successTitle}>Verification Link Sent</h4>
            <p className={styles.successDescription}>
              A secure link has been sent to <strong>{user?.email}</strong>. Please check your inbox to complete the verification process.
            </p>
            <button type="button" className={styles.successBtn} onClick={handleCloseBottomSheet}>
              Done
            </button>
          </div>
        ) : (
          <>
            {errorMessage && (
              errorMessage === 'UNSUPPORTED_REGION' ? (
                <div style={{
                  backgroundColor: 'rgba(255, 59, 48, 0.05)',
                  border: '1px solid rgba(255, 59, 48, 0.15)',
                  padding: '1.2rem',
                  borderRadius: '16px',
                  marginBottom: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  {isSupportSubmitted ? (
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#4ade80', fontWeight: 'bold' }}>
                      ✓ Request logged. Our operations team has received your country review request.
                    </p>
                  ) : (
                    <>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#ff3b30', fontWeight: 'bold' }}>
                        SMS Region Restriction Active
                      </p>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#888888', lineHeight: 1.4 }}>
                        This region is currently not supported for SMS verification. Please submit your review request below:
                      </p>
                      <textarea
                        placeholder="Briefly state your region support requirement..."
                        value={formVal.supportFeedback || ''}
                        onChange={(e) => setFormVal(prev => ({ ...prev, supportFeedback: e.target.value }))}
                        style={{
                          background: 'rgba(0, 0, 0, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '8px',
                          padding: '8px 12px',
                          color: '#ffffff',
                          fontSize: '0.78rem',
                          height: '60px',
                          resize: 'none',
                          outline: 'none'
                        }}
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                        <button
                          type="button"
                          onClick={() => setIsSupportSubmitted(true)}
                          style={{
                            background: '#0095f6',
                            border: 'none',
                            color: '#ffffff',
                            fontSize: '0.72rem',
                            fontWeight: 'bold',
                            padding: '6px 12px',
                            borderRadius: '100px',
                            cursor: 'pointer'
                          }}
                        >
                          Submit Review
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setErrorMessage('');
                            setIsSupportSubmitted(false);
                          }}
                          style={{
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.08)',
                            color: '#ffffff',
                            fontSize: '0.72rem',
                            fontWeight: 'bold',
                            padding: '6px 12px',
                            borderRadius: '100px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className={styles.errorText}>{errorMessage}</p>
              )
            )}

            {/* EMAIL SHEET DETAILS */}
            {editField === 'email' && (
              <div className={styles.sheetContent}>
                {user?.isEmailVerified ? (
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>New Email Address</label>
                    <input 
                      type="email" 
                      name="newEmail"
                      value={formVal.newEmail || ''}
                      onChange={handleInputChange}
                      placeholder="name@example.com"
                      className={styles.inputField}
                      required
                    />
                  </div>
                ) : user?.emailVerificationExpires && new Date(user.emailVerificationExpires) > new Date() ? (
                  <p className={styles.helpText}>
                    A verification link is currently active and was sent to <strong>{user?.email}</strong>. Please check your inbox. If you did not receive it, you can request a new link below.
                  </p>
                ) : (
                  <p className={styles.helpText}>
                    We will send a secure verification link to <strong>{user?.email}</strong>. Clicking the link will verify and unlock all features of your Cloud-Base account.
                  </p>
                )}
              </div>
            )}

            {/* PHONE SHEET DETAILS */}
            {editField === 'phone' && (
              <div className={styles.sheetContent}>
                {!isOtpSent ? (
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Phone Number</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        name="countryCode"
                        value={formVal.countryCode || '+91'}
                        onChange={handleInputChange}
                        style={{
                          width: '110px',
                          background: 'rgba(255, 255, 255, 0.02)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          padding: '0.85rem 0.8rem',
                          fontSize: '0.92rem',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="+91" style={{ background: '#000000', color: '#ffffff' }}>IND (+91)</option>
                        <option value="+1" style={{ background: '#000000', color: '#ffffff' }}>USA (+1)</option>
                        <option value="+971" style={{ background: '#000000', color: '#ffffff' }}>ARE (+971)</option>
                      </select>
                      <input 
                        type="tel" 
                        name="phonenumberRaw"
                        value={formVal.phonenumberRaw || ''}
                        onChange={handleInputChange}
                        placeholder="99999 99999"
                        className={styles.inputField}
                        style={{ flex: 1 }}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Enter 6-digit OTP Code</label>
                    <input 
                      type="text" 
                      name="otpCode"
                      value={formVal.otpCode || ''}
                      onChange={handleInputChange}
                      placeholder="000000"
                      maxLength={6}
                      className={styles.inputField}
                      required
                    />
                  </div>
                )}
              </div>
            )}

            {/* PASSWORD SHEET DETAILS */}
            {editField === 'password' && (
              <div className={styles.sheetContent}>
                <div className={styles.inputGroup}>
                  <label className={styles.inputLabel}>Current Password</label>
                  <input 
                    type="password" 
                    name="currentPassword"
                    value={formVal.currentPassword || ''}
                    onChange={handleInputChange}
                    placeholder="••••••••••••"
                    className={styles.inputField}
                    required
                  />
                </div>
                <div className={styles.inputGroup} style={{ marginTop: '0.8rem' }}>
                  <label className={styles.inputLabel}>New Password</label>
                  <input 
                    type="password" 
                    name="newPassword"
                    value={formVal.newPassword || ''}
                    onChange={handleInputChange}
                    placeholder="••••••••••••"
                    className={styles.inputField}
                    required
                  />
                </div>
                <div className={styles.inputGroup} style={{ marginTop: '0.8rem' }}>
                  <label className={styles.inputLabel}>Confirm New Password</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    value={formVal.confirmPassword || ''}
                    onChange={handleInputChange}
                    placeholder="••••••••••••"
                    className={styles.inputField}
                    required
                  />
                </div>
              </div>
            )}

            {/* 2FA SETUP SHEET DETAILS */}
            {editField === '2fa' && (
              <div className={styles.sheetContent}>
                {authenticatorSetupData ? (
                  <div style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '1.2rem',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#ffffff', fontWeight: 'bold' }}>
                      Setup Authenticator App
                    </p>
                    <p style={{ margin: 0, fontSize: '0.78rem', color: '#888888', lineHeight: 1.4 }}>
                      Enter this secret key in your authenticator app (like Google Authenticator):
                    </p>
                    <div style={{
                      background: '#111111',
                      border: '1px solid #222222',
                      borderRadius: '8px',
                      padding: '10px',
                      color: '#0095f6',
                      fontSize: '0.85rem',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      letterSpacing: '1px'
                    }}>
                      {authenticatorSetupData.secret}
                    </div>
                    <div className={styles.inputGroup} style={{ marginTop: '8px' }}>
                      <label className={styles.inputLabel}>Enter 6-digit Code</label>
                      <input 
                        type="text" 
                        value={authenticatorCode}
                        onChange={(e) => setAuthenticatorCode(e.target.value)}
                        placeholder="000000"
                        maxLength={6}
                        className={styles.inputField}
                        required
                      />
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                      <button
                        type="button"
                        onClick={() => verifyAuthenticatorMutation.mutate(authenticatorCode)}
                        style={{
                          background: '#0095f6',
                          border: 'none',
                          color: '#ffffff',
                          fontWeight: 'bold',
                          padding: '8px 16px',
                          borderRadius: '100px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                        disabled={verifyAuthenticatorMutation.isPending}
                      >
                        {verifyAuthenticatorMutation.isPending ? 'Verifying...' : 'Verify & Enable'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthenticatorSetupData(null);
                          setAuthenticatorCode('');
                          setFormVal(prev => ({ ...prev, 'twoFactorMethods.authenticator': false }));
                        }}
                        style={{
                          background: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          fontWeight: 'bold',
                          padding: '8px 16px',
                          borderRadius: '100px',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 0',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                    }}>
                      <div>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: '#ffffff', fontWeight: 'bold' }}>
                          Enable Two-Factor Authentication
                        </p>
                        <p style={{ margin: 0, fontSize: '0.75rem', color: '#666666' }}>
                          Secure account logins with secondary validation.
                        </p>
                      </div>
                      <input 
                        type="checkbox"
                        checked={formVal.twoFactorEnabled}
                        onChange={(e) => setFormVal(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
                        style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#0095f6' }}
                      />
                    </div>

                    {formVal.twoFactorEnabled && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', marginTop: '0.8rem' }}>
                        <label className={styles.inputLabel}>Verification Methods</label>
                        
                        {/* Email Method Toggle */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#ffffff', fontWeight: '600' }}>
                              Email Verification
                            </p>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#666666' }}>
                              Send OTP to your registered email address.
                            </p>
                          </div>
                          <input 
                            type="checkbox"
                            checked={formVal['twoFactorMethods.email']}
                            onChange={(e) => setFormVal(prev => ({ ...prev, 'twoFactorMethods.email': e.target.checked }))}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0095f6' }}
                          />
                        </div>

                        {/* Authenticator Method Toggle */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#ffffff', fontWeight: '600' }}>
                              Google Authenticator App
                            </p>
                            <p style={{ margin: 0, fontSize: '0.72rem', color: '#666666' }}>
                              Use authenticator app to generate keys.
                            </p>
                          </div>
                          <input 
                            type="checkbox"
                            checked={formVal['twoFactorMethods.authenticator']}
                            onChange={(e) => {
                              const checked = e.target.checked;
                              if (checked && !user?.authenticatorSecret) {
                                setupAuthenticatorMutation.mutate();
                              } else {
                                setFormVal(prev => ({ ...prev, 'twoFactorMethods.authenticator': checked }));
                              }
                            }}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#0095f6' }}
                          />
                        </div>

                        {/* Primary Method Selector */}
                        <div className={styles.inputGroup} style={{ marginTop: '0.5rem' }}>
                          <label className={styles.inputLabel}>Primary Verification Channel</label>
                          <select 
                            name="twoFactorPrimary" 
                            value={formVal.twoFactorPrimary || 'email'} 
                            onChange={handleInputChange}
                            className={styles.selectField}
                          >
                            <option value="email">Email OTP Code</option>
                            {((formVal['twoFactorMethods.authenticator'] && user?.authenticatorSecret) || setupAuthenticatorMutation.isPending) && (
                              <option value="authenticator">Google Authenticator App</option>
                            )}
                          </select>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ACCOUNT DEACTIVATION / DELETION DETAILS */}
            {(editField === 'deactivate' || editField === 'delete') && (
              <div className={styles.sheetContent}>
                {!isOtpSent ? (
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Enter Account Password</label>
                    <input 
                      type="password" 
                      name="password"
                      value={formVal.password || ''}
                      onChange={handleInputChange}
                      placeholder="••••••••••••"
                      className={styles.inputField}
                      required
                    />
                  </div>
                ) : (
                  <div className={styles.sheetContent}>
                    <div className={styles.inputGroup}>
                      <label className={styles.inputLabel}>Security Verification OTP</label>
                      <input 
                        type="text" 
                        name="otpCode"
                        value={formVal.otpCode || ''}
                        onChange={handleInputChange}
                        placeholder="000000"
                        maxLength={6}
                        className={styles.inputField}
                        required
                      />
                    </div>
                    {editField === 'delete' && (
                      <div className={styles.inputGroup} style={{ marginTop: '0.8rem' }}>
                        <label className={styles.inputLabel}>
                          Type <strong>DELETE</strong> to confirm permanent deletion
                        </label>
                        <input 
                          type="text" 
                          name="confirmText"
                          value={formVal.confirmText || ''}
                          onChange={handleInputChange}
                          placeholder="DELETE"
                          className={styles.inputField}
                          required
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </BottomSheet>
      {/* 🤖 Invisible reCAPTCHA Anchor */}
      <div id="recaptcha-container"></div>
    </div>
  );
}
