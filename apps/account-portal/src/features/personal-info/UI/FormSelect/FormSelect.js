/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import styles from './FormSelect.module.css';

/**
 * Reusable Form Select Selector Component
 * Renders a drop-down field styled to match the dark theme and glow focus effects.
 */
export default function FormSelect({
  label,
  name,
  value,
  onChange,
  options = []
}) {
  return (
    <div className={styles.inputGroup}>
      {label && <label className={styles.inputLabel}>{label}</label>}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={styles.selectField}
      >
        {options.map((opt, idx) => (
          <option key={idx} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
