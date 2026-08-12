/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import styles from './AvatarCropperDesktop.module.css';
import FormButton from '@/features/personal-info/UI/FormButton/FormButton';

export default function AvatarCropperDesktop({
  rawImage,
  imgRef,
  zoom,
  setZoom,
  position,
  setPosition,
  isDragging,
  setIsDragging,
  dragStart,
  setDragStart,
  isLandscape,
  constrainPosition,
  onCancel,
  onSave
}) {
  return (
    <div className={styles.cropperContainer}>
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
          const rawX = touch.clientX - dragStart.x;
          const rawY = touch.clientY - dragStart.y;
          setPosition(constrainPosition(rawX, rawY, zoom));
        }}
        onTouchEnd={() => setIsDragging(false)}
        onMouseDown={(e) => {
          setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
          setIsDragging(true);
        }}
        onMouseMove={(e) => {
          if (!isDragging) return;
          const rawX = e.clientX - dragStart.x;
          const rawY = e.clientY - dragStart.y;
          setPosition(constrainPosition(rawX, rawY, zoom));
        }}
        onMouseUp={() => setIsDragging(false)}
        onMouseLeave={() => setIsDragging(false)}
      >
        {/* Viewport circular outline */}
        <div className={styles.cropperViewportRing} />
        
        {/* Draggable image */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            setZoom(val);
            setPosition(prev => constrainPosition(prev.x, prev.y, val));
          }}
          className={styles.zoomSlider}
        />
      </div>

      <div className={styles.lightboxActions}>
        <FormButton 
          variant="secondary" 
          onClick={onCancel}
        >
          Cancel
        </FormButton>
        <FormButton 
          variant="primary" 
          onClick={onSave}
        >
          Select Photo
        </FormButton>
      </div>
    </div>
  );
}
