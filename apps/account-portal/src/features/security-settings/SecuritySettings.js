'use client';
import useWindowSize from '../../hooks/useWindowSize';
import SecuritySettingsMobile from './Mobile/SecuritySettingsMobile/SecuritySettingsMobile';
import SecuritySettingsTablet from './Tablet/SecuritySettingsTablet/SecuritySettingsTablet';
import SecuritySettingsDesktop from './Desktop/SecuritySettingsDesktop/SecuritySettingsDesktop';

/**
 * Signin & Security Settings Component Wrapper
 */
const SecuritySettings = ({ user }) => {
  const { width } = useWindowSize();

  // If width is undefined (during server SSR/hydration), render Mobile view as fallback
  if (width === undefined) {
    return <SecuritySettingsMobile user={user} />;
  }

  if (width >= 1024) {
    return <SecuritySettingsDesktop user={user} />;
  }

  if (width >= 768) {
    return <SecuritySettingsTablet user={user} />;
  }

  return <SecuritySettingsMobile user={user} />;
};

export default SecuritySettings;
