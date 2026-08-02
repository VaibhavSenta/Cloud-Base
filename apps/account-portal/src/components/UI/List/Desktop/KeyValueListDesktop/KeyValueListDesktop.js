'use client';
import styles from './KeyValueListDesktop.module.css';

export default function KeyValueListDesktop({ fields = [], onEditClick }) {
  return (
    <div className={styles.infoList}>
      {fields.map((field, idx) => (
        <div 
          key={idx} 
          className={`${styles.infoItem} ${!field.isEditable ? styles.nonEditable : ''}`}
          onClick={field.isEditable && onEditClick ? () => onEditClick(field.key) : undefined}
        >
          <div className={styles.rowMeta}>
            <span className={styles.infoLabel}>{field.label}</span>
            <span className={styles.infoValue}>{field.value}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
