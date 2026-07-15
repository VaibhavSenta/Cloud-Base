'use client';
import { useState, useEffect } from 'react';
import styles from './ProfileProgress.module.css';

const ProfileProgress = ({ user }) => {
  const [shouldDisappear, setShouldDisappear] = useState(false);
  const [isRendered, setIsRendered] = useState(true);

  // Logic to calculate completeness
  const steps = [
    { label: 'Account Created', value: true },
    { label: 'Email Verified', value: user?.isEmailVerified || false },
    { label: 'Name Added', value: !!(user?.firstName && user?.lastName) },
    { label: 'Profile Photo', value: !!user?.profilePic && !user.profilePic.includes('person.svg') },
    { label: 'Phone Number Verified', value: !!user?.phonenumber },
    { label: 'Two-Factor Authentication', value: user?.twoFactorEnabled || false },
  ];

  const completedSteps = steps.filter(s => s.value).length;
  const percentage = (completedSteps / steps.length) * 100;
  const isComplete = completedSteps === steps.length;

  useEffect(() => {
    if (isComplete) {
      const timer = setTimeout(() => {
        setShouldDisappear(true);
      }, 3500); // Hold for 3.5 seconds

      const unrenderTimer = setTimeout(() => {
        setIsRendered(false);
      }, 5700); // 3.5s hold + 2.2s animation duration

      return () => {
        clearTimeout(timer);
        clearTimeout(unrenderTimer);
      };
    } else {
      setShouldDisappear(false);
      setIsRendered(true);
    }
  }, [isComplete]);

  if (!isRendered) return null;

  return (
    <div className={`${styles.wrapper} ${isComplete && !shouldDisappear ? styles.appear : ''} ${shouldDisappear ? styles.disappear : ''}`}>
      {!isComplete && (
        <>
          <div className={styles.header}>
            <span className={styles.label}>Profile Completion</span>
            <span className={styles.percent}>{Math.round(percentage)}%</span>
          </div>
          <div className={styles.track}>
            <div 
              className={styles.bar} 
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </>
      )}
      <p className={styles.hint} style={isComplete ? { margin: 0, textAlign: 'center' } : {}}>
        {isComplete 
          ? 'Your account is fully optimized.'
          : `Complete ${steps.find(s => !s.value)?.label} to unlock full features.`}
      </p>
    </div>
  );
};

export default ProfileProgress;
