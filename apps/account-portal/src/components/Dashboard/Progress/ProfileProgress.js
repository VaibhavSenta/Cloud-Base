'use client';
import styles from './ProfileProgress.module.css';

const ProfileProgress = ({ user }) => {
  // Logic to calculate completeness
  const steps = [
    { label: 'Account Created', value: true },
    { label: 'Email Verified', value: user?.isEmailVerified || false },
    { label: 'Name Added', value: !!(user?.firstName && user?.lastName) },
    { label: 'Profile Photo', value: !!user?.profilePic && !user.profilePic.includes('person.svg') },
  ];

  const completedSteps = steps.filter(s => s.value).length;
  const percentage = (completedSteps / steps.length) * 100;

  return (
    <div className={styles.wrapper}>
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
      <p className={styles.hint}>
        {completedSteps < steps.length 
          ? `Complete ${steps.find(s => !s.value)?.label} to unlock full features.`
          : 'Your account is fully optimized! 🛡️'}
      </p>
    </div>
  );
};

export default ProfileProgress;
