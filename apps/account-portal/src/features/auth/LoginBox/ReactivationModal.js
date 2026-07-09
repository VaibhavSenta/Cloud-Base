'use client';
import styles from './ReactivationModal.module.css';

export default function ReactivationModal({ isOpen, deletionDate, onReactivate, onCancel, isLoading }) {
  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modalCard}>
        <span className={styles.title}>Account Reactivation</span>
        <p className={styles.message}>
          Your account is currently scheduled for deletion on {formatDate(deletionDate)}. 
          If you proceed, this deletion request will be canceled and your account will be reactivated.
        </p>
        <div className={styles.buttonGroup}>
          <button 
            type="button" 
            className={styles.reactivateBtn} 
            onClick={onReactivate}
            disabled={isLoading}
          >
            {isLoading ? 'Reactivating...' : 'Reactivate Account'}
          </button>
          <button 
            type="button" 
            className={styles.cancelBtn} 
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
