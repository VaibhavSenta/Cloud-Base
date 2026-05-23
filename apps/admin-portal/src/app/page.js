'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Dashboard par redirect karne ke liye
import axios from 'axios';
import styles from './page.module.css';

export default function AdminLogin() {
  const router = useRouter()
  const [formData, setFormData] = useState({ loginid: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    
    const result = axios.get('/api/admin/auth/login').then((res)=>{
      if (res.data.redirectUrl === "/dashboard") {
        router.push(res.data.redirectUrl)
      }
      
    })
  }, [router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading) return; // Agar pehle se request chal rahi hai, toh kuch mat karo
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const result = await axios.post(`/api/admin/auth/login`, formData)
      console.log('Login Success:', result.data);
      // Backend se response aate hi direct dashboard screen par move karo
      if (result.data.success && result.data.redirectUrl) {
        router.push(result.data.redirectUrl);
      } else {
        router.push("/dashboard"); // Fallback safe route
      }
    } catch (error) {
      console.error('Login Failed:', error.response?.data || error.message);
      setErrorMsg(error.response?.data?.message || 'Unauthorized Access or Server Error');
    } finally {
      setIsLoading(false);
    }
    // Yahan tera proxy route call hoga baad mein: /api/admin/auth/login
    console.log('Logging in with:', formData);
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <div className={styles.header}>
          <h1 className={styles.logoText}>
            Cloud<span>Base</span>
          </h1>
          <p className={styles.subtitle}>Admin Portal Security Gate</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {/* Cyber Security Alert Box - Sirf tab dikhega jab error aayega */}
          {errorMsg && (
            <div style={{
              background: 'rgba(255, 0, 0, 0.1)',
              border: '1px solid #ff0000',
              color: '#ff4d4d',
              padding: '10px',
              borderRadius: '6px',
              fontSize: '13px',
              textAlign: 'center',
              fontWeight: '500'
            }}>
              ⚠️ {errorMsg}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="loginid">loginid</label>
            <input
              type="text"
              id="loginid"
              name="loginid"
              className={styles.input}
              placeholder="Enter admin loginid"
              value={formData.loginid}
              onChange={handleChange}
              required
              autoComplete="off"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className={styles.input}
              placeholder="Enter secure password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={isLoading}>
            {isLoading ? 'Verifying Credentials...' : 'Sign In to Console'}
            
          </button>
        </form>
      </div>
    </div>
  );
}