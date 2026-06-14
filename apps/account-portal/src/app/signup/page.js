'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import SignupBox from '../../components/SignupBox/SignupBox';
import WelcomeScreen from '../../components/WelcomeScreen/WelcomeScreen';

export default function SignupPage() {
  const [showWelcome, setShowWelcome] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleSignupSuccess = (userData) => {
    // Force set user in cache for dashboard
    queryClient.setQueryData(['user'], userData);
    setShowWelcome(true);
  };

  const handleWelcomeComplete = () => {
    // After signup welcome, take them to the dashboard route
    router.push('/dashboard');
  };

  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  return <SignupBox onAuthSuccess={handleSignupSuccess} />;
}
