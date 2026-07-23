'use client';
import useWindowSize from '../../hooks/useWindowSize';
import DashboardMobile from './Mobile/DashboardMobile';
import DashboardTablet from './Tablet/DashboardTablet';
import DashboardDesktop from './Desktop/DashboardDesktop';
import styles from './Dashboard.module.css';

/**
 * Universal Dashboard Wrapper (The Controller)
 */
const Dashboard = ({ user }) => {
  const { width } = useWindowSize();
  
  const renderVariant = () => {
    if (width < 768) return <DashboardMobile user={user} />;
    if (width < 1024) return <DashboardTablet user={user} />;
    return <DashboardDesktop user={user} />;
  };

  return (
    <div className={styles.dashboardWrapper}>
      {renderVariant()}
    </div>
  );
};

export default Dashboard;
