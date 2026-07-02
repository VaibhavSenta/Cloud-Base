'use client';
import { useState } from 'react';
import Link from 'next/link';
import styles from '../public-pages.module.css';
import Logo from '../../components/Logo/Logo';

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate submission
    setSubmitted(true);
  };

  return (
    <div className={styles.container}>
      <Logo forceVersion="icon" />

      <div className={styles.card}>
        <header className={styles.header}>
          <h1 className={styles.title}>Contact Support</h1>
          <p className={styles.subtitle}>Reach out for secure help and developer inquires.</p>
        </header>

        {submitted ? (
          <div className={styles.successMessage}>
            <p>✓ Your secure support ticket has been received. Our team will reach out to you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.content}>
            <div className={styles.formGroup}>
              <label className={styles.label}>Full Name</label>
              <input 
                type="text" 
                name="name" 
                value={form.name} 
                onChange={handleChange} 
                className={styles.input} 
                placeholder="John Doe" 
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Email Address</label>
              <input 
                type="email" 
                name="email" 
                value={form.email} 
                onChange={handleChange} 
                className={styles.input} 
                placeholder="john.doe@example.com" 
                required 
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.label}>Secure Message</label>
              <textarea 
                name="message" 
                value={form.message} 
                onChange={handleChange} 
                className={styles.textarea} 
                placeholder="Describe your inquiry..." 
                required 
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              Submit Inquiry
            </button>
          </form>
        )}

        <div className={styles.footer}>
          <Link href="/" className={styles.backBtn}>
            ← Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
