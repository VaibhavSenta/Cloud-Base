'use client';
import useWindowSize from '../../hooks/useWindowSize';
import ActivityDetailMobile from './Mobile/ActivityDetailMobile/ActivityDetailMobile';

/**
 * Activity Detail View Wrapper
 */
const ActivityDetail = ({ logId }) => {
  const { width } = useWindowSize();

  // Mobile-first fallback to Mobile view
  return <ActivityDetailMobile logId={logId} />;
};

export default ActivityDetail;
