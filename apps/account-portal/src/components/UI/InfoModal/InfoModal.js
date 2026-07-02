import styles from './InfoModal.module.css';

export default function InfoModal({ isOpen, title, message, onClose }) {
  if (!isOpen) return null;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <span className={styles.title}>{title}</span>
        <p className={styles.message}>{message}</p>
        <button type="button" className={styles.btn} onClick={onClose}>
          Got it
        </button>
      </div>
    </div>
  );
}
