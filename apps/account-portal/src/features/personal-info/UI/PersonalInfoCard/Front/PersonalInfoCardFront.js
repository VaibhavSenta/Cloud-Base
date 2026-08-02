'use client';
import styles from './PersonalInfoCardFront.module.css';

/**
 * PersonalInfoCardFront component rendering the list of key-value fields.
 */
export default function PersonalInfoCardFront({ title, fields = [], onEditClick, isFlipped }) {
  return (
    <div className={`${styles.cardFront} ${isFlipped ? styles.hidden : ''}`}>
      <h3 className={styles.cardTitle}>{title}</h3>
      <div className={styles.contentArea}>
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
    </div>
  );
}
