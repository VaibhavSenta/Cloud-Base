'use client';
import styles from './KeyValueListMobile.module.css';

export default function KeyValueListMobile({ title, fields = [], onEditClick }) {
  return (
    <div className={styles.card}>
      <h3 className={styles.cardTitle}>{title}</h3>
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
    </div>
  );
}
