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
  isLandscape
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
          <div className={styles.cropperWrapper}>
            <div className={styles.cropperHeader}>
              <h3>Crop Profile Picture</h3>
              <p>Drag to center and use slider to zoom</p>
            </div>
            
            <div 
              className={styles.cropperFrame}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
                setIsDragging(true);
              }}
              onTouchMove={(e) => {
                if (!isDragging) return;
                const touch = e.touches[0];
                setPosition({
                  x: touch.clientX - dragStart.x,
                  y: touch.clientY - dragStart.y
                });
              }}
              onTouchEnd={() => setIsDragging(false)}
              onMouseDown={(e) => {
                setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
                setIsDragging(true);
              }}
              onMouseMove={(e) => {
                if (!isDragging) return;
                setPosition({
                  x: e.clientX - dragStart.x,
                  y: e.clientY - dragStart.y
                });
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              {/* Viewport circular outline */}
              <div className={styles.cropperViewportRing} />
              
              {/* Draggable image */}
              <img 
                ref={imgRef}
                src={rawImage}
                alt="Crop Target"
                className={styles.cropperImage}
                style={{
                  width: isLandscape ? 'auto' : '100%',
                  height: isLandscape ? '100%' : 'auto',
                  top: '50%',
                  left: '50%',
                  transform: `translate(-50%, -50%) translate(${position.x}px, ${position.y}px) scale(${zoom})`,
                }}
                draggable={false}
              />
            </div>
            
            {/* Zoom control slider */}
            <div className={styles.zoomControl}>
              <span className={styles.zoomLabel}>Zoom</span>
              <input 
                type="range"
                min="1"
                max="3"
                step="0.05"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className={styles.zoomSlider}
              />
            </div>

            <div className={styles.lightboxActions}>
              <FormButton 
                variant="secondary" 
                onClick={() => setRawImage(null)}
              >
                Cancel
              </FormButton>
              <FormButton 
                variant="primary" 
                onClick={cropImage}
              >
                Apply Crop
              </FormButton>
            </div>
          </div>
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
