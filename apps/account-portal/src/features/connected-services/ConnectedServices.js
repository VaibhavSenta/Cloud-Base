'use client';
import useWindowSize from '../../hooks/useWindowSize';
import ConnectedServicesMobile from './Mobile/ConnectedServicesMobile';
import ConnectedServicesTablet from './Tablet/ConnectedServicesTablet';
import ConnectedServicesDesktop from './Desktop/ConnectedServicesDesktop';

/**
 * Connected Services Settings Component Wrapper (Controller)
 * Enforces the Component Wrapper Pattern for Cloud-Base services.
 */
const ConnectedServices = () => {
  const { width } = useWindowSize();

  // SSR / Hydration Fallback: Render Mobile view as default
  if (width === undefined) {
    return <ConnectedServicesMobile />;
  }

  if (width >= 1024) {
    return <ConnectedServicesDesktop />;
  }

  if (width >= 768) {
    return <ConnectedServicesTablet />;
  }

  return <ConnectedServicesMobile />;
};

export default ConnectedServices;
