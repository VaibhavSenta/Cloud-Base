/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import FormButton from '../FormButton/FormButton';
import AvatarCropper from '@/components/UI/Cropper/AvatarCropper';
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
  handleSubmit,
  rawImage,
  setRawImage,
  zoom,
  setZoom,
  position,
  setPosition,
  isDragging,
  setIsDragging,
  dragStart,
  setDragStart,
  imgRef,
  cropImage,
  isLandscape,
  constrainPosition
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
        {rawImage ? (
          <AvatarCropper
            rawImage={rawImage}
            imgRef={imgRef}
            zoom={zoom}
            setZoom={setZoom}
            position={position}
            setPosition={setPosition}
            isDragging={isDragging}
            setIsDragging={setIsDragging}
            dragStart={dragStart}
            setDragStart={setDragStart}
            isLandscape={isLandscape}
            constrainPosition={constrainPosition}
            onCancel={() => setRawImage(null)}
            onSave={cropImage}
          />
        ) : (
          <>
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
              <img 
                src={selectedPreview || getSafeAvatar(user?.profilePic)} 
                alt="Profile Background" className={styles.lightboxBgImg}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/user-icon.png'; }}
              />
              
              {/* Sharp Foreground Layer */}
              <img 
                src={selectedPreview || getSafeAvatar(user?.profilePic)} 
                alt="Profile Picture" className={styles.lightboxImg}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/user-icon.png'; }}
              />
            </div>

            {/* Bottom Action Panel */}
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
          </>
        )}
      </div>
    </div>,
    document.body
  );
}
