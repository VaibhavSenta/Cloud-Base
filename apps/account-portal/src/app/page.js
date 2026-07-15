'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import LoginBox from '@/features/auth/LoginBox/LoginBox';
import WelcomeScreen from '@/features/welcome-screen/WelcomeScreen';
import api from '../utils/api';
import LoadingScreen from '../components/UI/LoadingScreen/LoadingScreen';

export default function Home() {
  const router = useRouter();
  const [showWelcome, setShowWelcome] = useState(false);

  const { data: user, isLoading, status } = useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const response = await api.get('/auth/me');
        return response.data.data;
      } catch (err) {
        return null;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 10,
  });

  // If user is found, redirect to dashboard immediately
  useEffect(() => {
    if (!isLoading && user) {
      console.log('🚪 Home: User already logged in, moving to dashboard.');
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  const handleAuthSuccess = () => {
    setShowWelcome(true);
  };

  const handleWelcomeComplete = () => {
    router.replace('/dashboard');
  };

  if (isLoading || (user && !showWelcome)) {
    return <LoadingScreen />;
  }

  if (showWelcome) {
    return <WelcomeScreen onComplete={handleWelcomeComplete} />;
  }

  // Only show login if no user is found
  return (
    <main>
      <LoginBox onAuthSuccess={handleAuthSuccess} />
    </main>
  );
}
