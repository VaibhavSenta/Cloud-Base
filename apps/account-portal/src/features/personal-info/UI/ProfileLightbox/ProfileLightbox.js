'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import FormButton from '../FormButton/FormButton';
import styles from './ProfileLightbox.module.css';

/**
 * Reusable Profile Lightbox Modal Component
 * Renders the vertical 3/4 aspect ratio profile image modal via React Portal.
 * Incorporates full-viewport backdrop-filter blur and organic spring animation entry.
 */
export default function ProfileLightbox({
  isOpen,
  user,
  selectedPreview,
  isPending,
  getSafeAvatar,
  handleCloseModal,
  handleFileChange,
  handleSubmit
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted || !isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className={styles.modalOverlay} onClick={handleCloseModal}>
      <div className={styles.lightboxContainer} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalContent}>
          {/* Hidden File Input */}
          <input 
            type="file" 
            id="avatarInputDesktop" 
            accept="image/*" 
            onChange={handleFileChange} 
            className={styles.hiddenInput}
          />
          
          {/* Blurred Background Layer */}
          <Image 
            src={selectedPreview || getSafeAvatar(user?.profilePic)} 
            alt="Profile Background" 
            width={400} 
            height={533} 
            className={styles.lightboxBgImg}
            priority
          />
          
          {/* Sharp Foreground Layer */}
          <Image 
            src={selectedPreview || getSafeAvatar(user?.profilePic)} 
            alt="Profile Picture" 
            width={400} 
            height={533} 
            className={styles.lightboxImg}
            priority
          />
        </div>

        {/* Bottom Action Panel (Positioned outside the modalContent image box) */}
        <div className={styles.lightboxActions}>
          {selectedPreview ? (
            <>
              <FormButton 
                variant="secondary" 
                onClick={handleCloseModal}
              >
                Cancel
              </FormButton>
              <FormButton 
                variant="primary" 
                disabled={isPending}
                onClick={handleSubmit}
              >
                {isPending ? 'Saving...' : 'Save'}
              </FormButton>
            </>
          ) : (
            <>
              <FormButton 
                variant="secondary" 
                onClick={() => document.getElementById('avatarInputDesktop').click()}
              >
                Change
              </FormButton>
              <FormButton 
                variant="primary" 
                onClick={handleCloseModal}
              >
                Close
              </FormButton>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
