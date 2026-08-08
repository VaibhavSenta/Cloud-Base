'use client';
import useWindowSize from '../../hooks/useWindowSize';
import dynamic from 'next/dynamic';
import { useSecureQuery } from '../../hooks/useSecureQuery';
import api from '../../utils/api';
import CloudSpinner from '@/components/UI/CloudSpinner/CloudSpinner';

const ConnectedServicesMobile = dynamic(() => import('./Mobile/ConnectedServicesMobile'), { ssr: false });
const ConnectedServicesTablet = dynamic(() => import('./Tablet/ConnectedServicesTablet'), { ssr: false });
const ConnectedServicesDesktop = dynamic(() => import('./Desktop/ConnectedServicesDesktop'), { ssr: false });

/**
 * Connected Services Settings Component Wrapper (Controller)
 * Enforces the Component Wrapper Pattern for Nothing Box services.
 */
const ConnectedServices = () => {
  const { width } = useWindowSize();

  const { data: user, isLoading } = useSecureQuery({
    queryKey: ['user'],
    queryFn: async () => {
      const res = await api.get('/auth/me');
      return res.data.data;
    }
  });

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '300px', 
        gap: '1.5rem',
        color: '#a8a8a8', 
        fontSize: '0.85rem' 
      }}>
        <CloudSpinner size={72} />
        <span>Loading connected services...</span>
      </div>
    );
  }

  const connectedServices = user?.connectedServices || [];

  const sharedProps = {
    user,
    connectedServices
  };

  // SSR / Hydration Fallback: Render Mobile view as default
  if (width === undefined) {
    return <ConnectedServicesMobile {...sharedProps} />;
  }

  if (width >= 1024) {
    return <ConnectedServicesDesktop {...sharedProps} />;
  }

  if (width >= 768) {
    return <ConnectedServicesTablet {...sharedProps} />;
  }

  return <ConnectedServicesMobile {...sharedProps} />;
};

export default ConnectedServices;
