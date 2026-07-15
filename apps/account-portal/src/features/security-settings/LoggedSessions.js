import LoggedSessionsMobile from './Mobile/LoggedSessionsMobile';

/**
 * Logged Devices / Active Sessions Wrapper
 */
const LoggedSessions = () => {
  // Matches component wrapper pattern, defaulting to mobile
  return <LoggedSessionsMobile />;
};

export default LoggedSessions;
