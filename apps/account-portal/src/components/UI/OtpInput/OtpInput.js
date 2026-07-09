'use client';
import { useRef, useEffect } from 'react';
import styles from './OtpInput.module.css';

export default function OtpInput({ value = '', onChange, length = 6, error }) {
  const inputsRef = useRef([]);

  // Compute digits array from string value
  const digits = value
    .split('')
    .concat(Array(length).fill(''))
    .slice(0, length);

  const handleChange = (e, index) => {
    const val = e.target.value;
    // Allow only numeric input
    if (!/^\d*$/.test(val)) return;

    const newDigits = [...digits];
    // Keep only the last character entered
    newDigits[index] = val.slice(-1);
    const newValue = newDigits.join('');
    onChange(newValue);

    // Auto-focus next input if filled
    if (val && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newDigits = [...digits];
      if (!digits[index] && index > 0) {
        // If current cell is empty, clear previous cell and focus it
        newDigits[index - 1] = '';
        onChange(newDigits.join(''));
        inputsRef.current[index - 1]?.focus();
      } else {
        // Just clear current cell
        newDigits[index] = '';
        onChange(newDigits.join(''));
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, length);

    if (pastedData) {
      onChange(pastedData);
      const targetIndex = Math.min(pastedData.length, length - 1);
      inputsRef.current[targetIndex]?.focus();
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {digits.map((digit, index) => (
          <input
            key={index}
            id={`otp-input-${index}`}
            ref={(el) => (inputsRef.current[index] = el)}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            autoComplete="one-time-code"
          />
        ))}
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
