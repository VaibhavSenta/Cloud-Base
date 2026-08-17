/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import { useState } from 'react';
import styles from './UnlockBox.module.css';
import Button from '@/components/UI/Button/Button';

export default function UnlockBox({ chatUsername, onUnlock, loading, error }) {
  const [passphrase, setPassphrase] = useState('');
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    if (!passphrase.trim()) {
      setLocalError('Please enter your passphrase.');
      return;
    }
    onUnlock(passphrase.trim());
  };

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.card} ${passphrase.length > 0 ? styles.cardActive : ''}`}>
        <div className={styles.header}>
          <h1 className={styles.title}>Unlock Chat</h1>
          <p className={styles.subtitle}>
            Enter the passphrase for <strong>@{chatUsername}</strong> to decrypt your messages.
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.formGroup}>
          <input
            type="password"
            placeholder="Security Passphrase / PIN"
            className={styles.inputField}
            value={passphrase}
            onChange={(e) => setPassphrase(e.target.value)}
            required
            disabled={loading}
            autoFocus
          />
          {localError && <div className={styles.errorMessage}>{localError}</div>}
          {error && <div className={styles.errorMessage}>{error}</div>}

          <Button
            type="submit"
            disabled={loading || !passphrase}
          >
            {loading ? 'Decrypting...' : 'Unlock'}
          </Button>
        </form>
      </div>
    </div>
  );
}
