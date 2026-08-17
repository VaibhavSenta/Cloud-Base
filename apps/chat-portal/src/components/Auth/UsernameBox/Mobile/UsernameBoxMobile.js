/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import { useState, useEffect, useMemo } from 'react';
import styles from './UsernameBoxMobile.module.css';
import Button from '@/components/UI/Button/Button';
import BloomFilter from '@/utils/bloomFilter';
import api from '@/utils/api';

export default function UsernameBoxMobile({
  onCheckUsername,
  onCreateProfile,
  loading,
  error
}) {
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameError, setUsernameError] = useState('');

  const bloomFilter = useMemo(() => new BloomFilter(2048, 3), []);

  // Sync Bloom Filter bitArray from backend on mount
  useEffect(() => {
    let isMounted = true;
    const fetchBloomFilter = async () => {
      try {
        const response = await api.get('/chat/users/bloom-filter');
        if (response.data?.bitArray && isMounted) {
          bloomFilter.loadBitArray(
            response.data.bitArray,
            response.data.size,
            response.data.hashFunctions
          );
          console.log('⚡ Bloom Filter BitArray Synced for Instant Real-Time Instagram-style Checks!');
        }
      } catch (err) {
        console.warn('⚠️ Bloom Filter Sync Fallback:', err.message);
      }
    };

    fetchBloomFilter();
    return () => { isMounted = false; };
  }, [bloomFilter]);

  // Instagram-style real-time check function
  const validateUsernameRealtime = async (unameToTest) => {
    const val = unameToTest.trim();
    if (!val) {
      setUsernameError('');
      setUsernameAvailable(null);
      return;
    }

    if (val.length < 3) {
      setUsernameError('Username must be at least 3 characters.');
      setUsernameAvailable(null);
      return;
    }

    const usernameRegex = /^[a-z0-9_]+$/i;
    if (!usernameRegex.test(val)) {
      setUsernameError('Only letters, numbers, and underscores allowed.');
      setUsernameAvailable(null);
      return;
    }

    setUsernameChecking(true);
    setUsernameError('');
    setUsernameAvailable(null);

    // 1. O(1) Instant Bloom Filter Check
    const bloomResultHas = bloomFilter.has(val.toLowerCase());
    
    if (!bloomResultHas) {
      // 100% Guaranteed NOT in DB! (Zero Latency Instant Pass)
      console.log(`⚡ Bloom Filter: "${val}" is 100% AVAILABLE (O(1) Check)!`);
      setUsernameAvailable(true);
      setUsernameChecking(false);
      return;
    }

    // 2. Bloom Filter says "might exist" -> Verify with DB API
    const isAvailable = await onCheckUsername(val);
    setUsernameChecking(false);

    if (isAvailable) {
      setUsernameAvailable(true);
    } else {
      setUsernameError('Username is already taken.');
      setUsernameAvailable(false);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setUsername(val);
    validateUsernameRealtime(val);
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!username || !usernameAvailable) return;
    await onCreateProfile(username);
  };

  const handleClear = () => {
    setUsername('');
    setUsernameAvailable(null);
    setUsernameError('');
  };

  return (
    <div className={styles.wrapper}>
      <div className={`${styles.card} ${username.length > 0 ? styles.cardActive : ''}`}>
        <div className={styles.header}>
          <h1 className={styles.title}>Choose Username</h1>
          <p className={styles.subtitle}>
            Choose your unique Chat handle to get started
          </p>
        </div>

        <form onSubmit={handleUsernameSubmit} className={styles.formGroup}>
          <input
            type="text"
            placeholder="Username (e.g. vaibhav)"
            className={styles.inputField}
            value={username}
            onChange={handleInputChange}
            required
            disabled={loading}
            autoFocus
            spellCheck="false"
            autoCorrect="off"
            autoCapitalize="none"
          />

          {usernameChecking && (
            <div className={styles.infoMessage}>
              Checking availability...
            </div>
          )}
          {usernameError && <div className={styles.errorMessage}>{usernameError}</div>}
          {usernameAvailable && (
            <div className={styles.availableMessage}>Username is available</div>
          )}
          {error && <div className={styles.errorMessage}>{error}</div>}

          <Button
            type="submit"
            disabled={loading || !usernameAvailable}
          >
            {loading ? 'Continuing...' : 'Continue'}
          </Button>
        </form>
      </div>
    </div>
  );
}
