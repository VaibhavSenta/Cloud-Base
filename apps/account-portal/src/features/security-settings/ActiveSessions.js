import ActiveSessionsMobile from './Mobile/ActiveSessionsMobile/ActiveSessionsMobile';

/**
 * Logged Devices / Active Sessions Wrapper
 */
const ActiveSessions = () => {
  // Matches component wrapper pattern, defaulting to mobile
  return <ActiveSessionsMobile />;
};

export default ActiveSessions;
