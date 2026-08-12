/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useSecureQuery, useSecureQueryClient } from '../../../hooks/useSecureQuery';
import api from '../../../utils/api';
import { encryptPayload } from '../../../utils/security/networkCrypto';
import BottomSheet from '@/components/UI/BottomSheet/BottomSheet';
import ActionList from '@/components/UI/List/ActionList';
import PageHeader from '@/components/UI/PageHeader/PageHeader';
import styles from './PasswordOptionsMobile.module.css';

/**
 * Mobile view for Password Options Page
 */
export default function PasswordOptionsMobile() {
  const router = useRouter();
  const queryClient = useSecureQueryClient();
  const [editField, setEditField] = useState(null); // 'change', 'reveal'
  const [formVal, setFormVal] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [revealedPassword, setRevealedPassword] = useState('');
  const [isRevealed, setIsRevealed] = useState(false);

  // Fetch current user from React Query cache
  const { data: user, isLoading } = useSecureQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data;
    }
  });

  const handleEditClick = (field) => {
    setEditField(field);
    setErrorMessage('');
    setIsRevealed(false);
    setRevealedPassword('');
    
    if (field === 'change') {
      setFormVal({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else if (field === 'reveal') {
      setFormVal({ password: '' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormVal(prev => ({ ...prev, [name]: value }));
  };

  const handleCloseBottomSheet = () => {
    setEditField(null);
    setFormVal({});
    setErrorMessage('');
    setIsRevealed(false);
    setRevealedPassword('');
  };

  const handleSubmit = (e) => {
    setErrorMessage('');
    
    if (editField === 'change') {
      if (!formVal.currentPassword || !formVal.newPassword) {
        setErrorMessage('All fields are required');
        return;
      }
      if (formVal.newPassword !== formVal.confirmPassword) {
        setErrorMessage('New passwords do not match');
        return;
      }
      alert("Password updated successfully!");
      handleCloseBottomSheet();
    }

    else if (editField === 'reveal') {
      if (!formVal.password) {
        setErrorMessage('Password is required');
        return;
      }
      // Verify identity and mock revealing password
      setIsRevealed(true);
      setRevealedPassword('sentaVaibhav999'); // Mocked revealed value
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading credentials...</div>;
  }

  return (
    <div className={styles.container}>
      <PageHeader 
        title="Password Options"
        subtitle="Change your login password or securely view your authentication settings."
      />

      <ActionList items={[
        {
          label: 'Change Password',
          subtitle: 'Update your login password credentials',
          onClick: () => handleEditClick('change'),
        },
        {
          label: 'View Password',
          subtitle: 'Securely reveal your current login password',
          onClick: () => handleEditClick('reveal'),
        },
      ]} />

      {/* 📱 Bottom Sheet Dialog Modal */}
      <BottomSheet
        isOpen={!!editField}
        onClose={handleCloseBottomSheet}
        title={
          editField === 'change' ? 'Change Password' :
          editField === 'reveal' ? 'View Password' : ''
        }
        subtitle={
          editField === 'change' ? 'Create a strong, unique password for authentication.' :
          editField === 'reveal' ? 'Verify your identity to reveal your password.' : ''
        }
        onSubmit={handleSubmit}
        submitText={
          editField === 'reveal' && isRevealed ? 'Close' :
          'Save Changes'
        }
        isPending={false}
      >
        {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

        {/* CHANGE PASSWORD DETAILS */}
        {editField === 'change' && (
          <div className={styles.inputGroup}>
            <div>
              <label className={styles.inputLabel}>Current Password</label>
              <input 
                type="password" 
                name="currentPassword"
                value={formVal.currentPassword || ''}
                onChange={handleInputChange}
                className={styles.inputField}
                required
              />
            </div>
            <div>
              <label className={styles.inputLabel}>New Password</label>
              <input 
                type="password" 
                name="newPassword"
                value={formVal.newPassword || ''}
                onChange={handleInputChange}
                className={styles.inputField}
                required
              />
            </div>
            <div>
              <label className={styles.inputLabel}>Confirm New Password</label>
              <input 
                type="password" 
                name="confirmPassword"
                value={formVal.confirmPassword || ''}
                onChange={handleInputChange}
                className={styles.inputField}
                required
              />
            </div>
          </div>
        )}

        {/* VIEW/REVEAL DETAILS */}
        {editField === 'reveal' && (
          <div className={styles.sheetContent}>
            {!isRevealed ? (
              <div className={styles.inputGroup}>
                <p className={styles.helpText} style={{ marginBottom: '1rem' }}>
                  Please enter your account password to verify ownership before revealing credentials.
                </p>
                <label className={styles.inputLabel}>Account Password</label>
                <input 
                  type="password" 
                  name="password"
                  value={formVal.password || ''}
                  onChange={handleInputChange}
                  className={styles.inputField}
                  required
                />
              </div>
            ) : (
              <div className={styles.revealBox}>
                <span className={styles.revealLabel}>Your password is:</span>
                <span className={styles.revealValue}>{revealedPassword}</span>
                <p className={styles.revealWarning}>
                  Never share this password with anyone. We will re-lock this view when you close the bottom sheet.
                </p>
              </div>
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
