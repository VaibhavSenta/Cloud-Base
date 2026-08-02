'use client';
import { useQuery } from '@tanstack/react-query';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import LoginBox from '@/features/auth/LoginBox/LoginBox';
import WelcomeScreen from '@/features/welcome-screen/WelcomeScreen';
import api from '../utils/api';
import LoadingScreen from '../components/UI/LoadingScreen/LoadingScreen';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('continue') || searchParams.get('return_to') || searchParams.get('next') || searchParams.get('redirect');
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

  // If user is found, redirect to dashboard or back to the requesting app
  useEffect(() => {
    if (!isLoading && user) {
      console.log('🚪 Home: User already logged in.');
      if (redirectUrl) {
        console.log('🔄 SSO Redirect: Navigating back to', redirectUrl);
        window.location.href = redirectUrl;
      } else {
        router.replace('/dashboard');
      }
    }
  }, [user, isLoading, router, redirectUrl]);

  const handleAuthSuccess = () => {
    // If there's a redirect URL (SSO flow), go there directly
    if (redirectUrl) {
      console.log('🔄 SSO Redirect after login: Navigating to', redirectUrl);
      window.location.href = redirectUrl;
      return;
    }
    // Otherwise show welcome screen and go to dashboard
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

export default function Home() {
  return (
    <Suspense fallback={<div style={{ background: '#000', minHeight: '100dvh' }} />}>
      <HomeContent />
    </Suspense>
  );
}

