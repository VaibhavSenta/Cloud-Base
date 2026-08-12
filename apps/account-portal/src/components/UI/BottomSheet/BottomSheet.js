/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import { useEffect } from 'react';
import styles from './BottomSheet.module.css';

/**
 * Reusable Mobile-first Bottom Sheet Component
 */
export default function BottomSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  onSubmit,
  submitText = 'Save Changes',
  pendingText = 'Saving...',
  isPending = false,
  showActions = true,
  children
}) {
  
  // Lock body scroll when active
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (onSubmit) onSubmit(e);
  };

  return (
    <>
      {/* Background overlay */}
      <div className={styles.backdrop} onClick={onClose} />

    <div className={styles.bottomSheetWrapper}>
      {/* Slide-up Container */}
      <div className={styles.bottomSheet}>
        <div className={styles.sheetHeader}>
          {title && <h2 className={styles.sheetTitle}>{title}</h2>}
          {subtitle && <p className={styles.sheetSubtitle}>{subtitle}</p>}
        </div>

        <form onSubmit={handleFormSubmit} className={styles.form}>
          {children}

          {showActions && (
            <div className={styles.buttonGroup}>
              <button 
                type="button" 
                onClick={onClose} 
                className={styles.cancelBtn}
                disabled={isPending}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className={styles.submitBtn}
                disabled={isPending}
              >
                {isPending ? pendingText : submitText}
              </button>
            </div>
          )}
        </form>
      </div>
      
    </div>
    </>
  );
}
