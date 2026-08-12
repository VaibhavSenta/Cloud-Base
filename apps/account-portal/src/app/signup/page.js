/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import { useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useSecureQueryClient } from '../../hooks/useSecureQuery';
import SignupBox from '@/features/auth/SignupBox/SignupBox';
import WelcomeScreen from '@/features/welcome-screen/WelcomeScreen';

export default function SignupPage() {
  const [showWelcome, setShowWelcome] = useState(false);
  const router = useRouter();
  const queryClient = useSecureQueryClient();

  const handleSignupSuccess = (userData) => {
    // Force set user in cache securely for dashboard
    queryClient.setSecureQueryData(['user'], userData);
    setShowWelcome(true);
  };

  const handleWelcomeComplete = () => {
    // After signup welcome, take them to the dashboard route
    router.push('/dashboard');
  };

  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return (
    <Suspense fallback={<div style={{ color: '#666', textAlign: 'center', marginTop: '2rem', fontSize: '0.9rem' }}>Loading signup setup...</div>}>
      <SignupBox onAuthSuccess={handleSignupSuccess} />
    </Suspense>
  );
}
