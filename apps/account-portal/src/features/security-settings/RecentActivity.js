'use client';
import useWindowSize from '../../hooks/useWindowSize';
import RecentActivityMobile from './Mobile/RecentActivityMobile/RecentActivityMobile';

/**
 * Recent Activity / Security Audit Logs Wrapper
 */
const RecentActivity = () => {
  const { width } = useWindowSize();

  // Mobile-first fallback to Mobile view
  return <RecentActivityMobile />;
};

export default RecentActivity;
