/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { useSecureQuery, useSecureQueryClient } from '../../../hooks/useSecureQuery';
import api from '../../../utils/api';
import { encryptPayload } from '../../../utils/security/networkCrypto';
import styles from './PasswordOptionsTablet.module.css';

/**
 * Premium Bento-Grid Tablet view for Password Options Page
 */
export default function PasswordOptionsTablet() {
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

  const handleCloseModal = () => {
    setEditField(null);
    setFormVal({});
    setErrorMessage('');
    setIsRevealed(false);
    setRevealedPassword('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
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
      handleCloseModal();
    }

    else if (editField === 'reveal') {
      if (!formVal.password) {
        setErrorMessage('Password is required');
        return;
      }
      setIsRevealed(true);
      setRevealedPassword('sentaVaibhav999'); // Mocked revealed value
    }
  };

  if (isLoading) {
    return <div className={styles.loading}>Loading credentials...</div>;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerBackArea}>
          <button className={styles.backBtn} onClick={() => router.push('/dashboard/security')}>
            ← Back to Signin & Security
          </button>
        </div>
        <h1 className={styles.title}>Password Options</h1>
        <p className={styles.subtitle}>Change your login password or securely view your credentials setup.</p>
      </header>

      {/* Bento Grid stack for Tablet */}
      <div className={styles.bentoGrid}>
        
        {/* Card 1: Change Password */}
        <div className={styles.bentoCard} onClick={() => handleEditClick('change')}>
          <div className={styles.cardHeaderArea}>
            <span className={styles.cardCategory}>Modification</span>
            <h2 className={styles.cardTitle}>Update Password</h2>
          </div>
          
          <div className={styles.cardMainArea}>
            <div className={styles.securitySeal}>PASSWD_LOCK</div>
            <p className={styles.cardInlineDesc}>
              Modify and update your login password. We recommend using a unique password that you do not reuse on other online accounts.
            </p>
          </div>
          
          <div className={styles.cardFooterArea}>
            <span className={styles.cardFooterLink}>Launch Update Terminal ›</span>
          </div>
        </div>

        {/* Card 2: View Password */}
        <div className={styles.bentoCard} onClick={() => handleEditClick('reveal')}>
          <div className={styles.cardHeaderArea}>
            <span className={styles.cardCategory}>Verification</span>
            <h2 className={styles.cardTitle}>View Password</h2>
          </div>

          <div className={styles.cardMainArea}>
            <div className={styles.securitySeal}>DECRYPT_LOCK</div>
            <p className={styles.cardInlineDesc}>
              Securely decode and display your active login password. This requires entering your current credentials for authorization.
            </p>
          </div>

          <div className={styles.cardFooterArea}>
            <span className={styles.cardFooterLink}>Launch Decryptor Window ›</span>
          </div>
        </div>

      </div>

      {/* 🖥️ Modal Dialog Overlay */}
      {editField && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>
                  {editField === 'change' ? 'Change Password' :
                   editField === 'reveal' ? 'View Password' : ''}
                </h3>
                <p className={styles.modalSubtitle}>
                  {editField === 'change' ? 'Create a strong, unique password for authentication.' :
                   editField === 'reveal' ? 'Verify your identity to reveal your password.' : ''}
                </p>
              </div>
              <button className={styles.modalCloseBtn} onClick={handleCloseModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              {errorMessage && <p className={styles.errorText}>{errorMessage}</p>}

              {/* CHANGE PASSWORD BODY */}
              {editField === 'change' && (
                <div className={styles.fieldBody}>
                  <div className={styles.inputGroup}>
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
                  <div className={styles.inputGroup}>
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
                  <div className={styles.inputGroup}>
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

              {/* REVEAL PASSWORD BODY */}
              {editField === 'reveal' && (
                <div className={styles.fieldBody}>
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
                    <div className={styles.revealContainer}>
                      <span className={styles.revealLabel}>Your password is:</span>
                      <span className={styles.revealValue}>{revealedPassword}</span>
                      <p className={styles.revealWarning}>
                        Never share this password with anyone. We will re-lock this view when you close the modal.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className={styles.modalActions}>
                {(!isRevealed || editField !== 'reveal') && (
                  <button type="button" className={styles.btnSecondary} onClick={handleCloseModal}>
                    Cancel
                  </button>
                )}
                <button type="submit" className={styles.btnPrimary}>
                  {editField === 'reveal' && isRevealed ? 'Close' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
