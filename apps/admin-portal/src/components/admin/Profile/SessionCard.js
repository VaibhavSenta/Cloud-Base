import NextImage from 'next/image';
import styles from './SessionCard.module.css';

const SessionCard = ({ session, onTerminate, isToggling, formatDate }) => {
  return (
    <div className={styles.sessionCard}>
      <div className={styles.sessionIcon}>
        {session.deviceType === 'Mobile' ? (
          <NextImage src="/admin-images/smartphone.png" width={24} height={24} alt="Mobile" />
        ) : (
          <NextImage src="/admin-images/laptop_mac.png" width={24} height={24} alt="Desktop" />
        )}
      </div>
      <div className={styles.sessionInfo}>
        <div className={styles.sessionMain}>
          <h3>{session.deviceType} Session</h3>
          <span className={styles.ipBadge}>{session.ipAddress}</span>
        </div>
        <div className={styles.timeMeta}>
           <p>Logged: {formatDate(session.createdAt)}</p>
           <p>Active: {formatDate(session.lastActive)}</p>
        </div>
      </div>
      <button 
        className={styles.terminateBtn}
        onClick={() => onTerminate(session._id)}
        disabled={isToggling}
        title="Terminate Session"
      >
        <NextImage src="/admin-images/close.png" width={14} height={14} alt="Close" />
      </button>
    </div>
  );
};

export default SessionCard;
