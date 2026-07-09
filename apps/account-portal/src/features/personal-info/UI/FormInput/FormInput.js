'use client';
import styles from './FormInput.module.css';

/**
 * Reusable Form Input Component
 * Follows the standard fieldBody > inputGroup > inputLabel / inputField hierarchy.
 */
export default function FormInput({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder,
  required = false
}) {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.inputLabel}>{label}</label>}
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className={styles.inputField}
        required={required}
      />
    </div>
  );
}
