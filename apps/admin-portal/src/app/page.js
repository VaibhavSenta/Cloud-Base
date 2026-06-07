'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Dashboard par redirect karne ke liye
import axios from 'axios';
import styles from './page.module.css';

import LoginBox from '@/components/admin/LoginBox/LoginBox';

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
    if (isLoading) return; 
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      const result = await axios.post(`/api/admin/auth/login`, formData)
      if (result.data.success && result.data.redirectUrl) {
        router.push(result.data.redirectUrl);
      } else {
        router.push("/dashboard"); 
      }
    } catch (error) {
      setErrorMsg(error.response?.data?.message || 'Unauthorized Access or Server Error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.loginContainer}>
      <LoginBox 
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
        errorMsg={errorMsg}
      />
    </div>
  );
}