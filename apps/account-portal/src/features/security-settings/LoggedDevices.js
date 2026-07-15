'use client';
import useWindowSize from '../../hooks/useWindowSize';
import LoggedDevicesMobile from './Mobile/LoggedDevicesMobile';

/**
 * Logged Devices / Session Audit Logs Wrapper
 */
const LoggedDevices = () => {
  const { width } = useWindowSize();

  // Mobile-first fallback to Mobile view
  return <LoggedDevicesMobile />;
};

export default LoggedDevices;
