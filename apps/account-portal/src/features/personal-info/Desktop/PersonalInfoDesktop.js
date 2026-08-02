'use client';
import { useState, useEffect } from 'react';
import ProfileBanner from '../UI/ProfileBanner/ProfileBanner';
import ProfileLightbox from '../UI/ProfileLightbox/ProfileLightbox';
import PersonalInfoCard from '../UI/PersonalInfoCard/PersonalInfoCard';
import styles from './PersonalInfoDesktop.module.css';

/**
 * Desktop View for Personal Info (width >= 1024)
 * Featuring 3D Flip Bento Cards and vertical portal lightbox profile picture editor.
 */
export default function PersonalInfoDesktop({
  user,
  infoFields,
  contactFields,
  getSafeAvatar,
  handleEditClick,
  editField,
  formVal,
  selectedPreview,
  handleInputChange,
  handleFileChange,
  handleCloseModal,
  handleSubmit,
  isPending,
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
  cropImage
}) {
  const [activeField, setActiveField] = useState(editField || 'username');

  useEffect(() => {
    if (editField && editField !== 'profilePic') {
      setActiveField(editField);
    }
  }, [editField]);

  const isBasicFlipped = ['username', 'name', 'dob', 'gender'].includes(editField);
  const isContactFlipped = editField === 'recoveryEmail';

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Personal Info</h1>
        <p className={styles.subtitle}>Manage your profile details and preferences.</p>
      </div>

      <div className={styles.bentoGrid}>
        {/* Row 1: Profile Cover Banner */}
        <ProfileBanner
          user={user}
          getSafeAvatar={getSafeAvatar}
          onClick={() => handleEditClick('profilePic')}
        />

        {/* Row 2: 2-column lower section using 3D Flip Bento Cards */}
        <div className={styles.lowerSection}>
          
          {/* Column 1: Basic Profile Metadata */}
          <PersonalInfoCard
            title="Basic Profile"
            fields={infoFields}
            onEditClick={handleEditClick}
            isFlipped={isBasicFlipped}
            editField={editField}
            activeField={activeField}
            formVal={formVal}
            handleInputChange={handleInputChange}
            handleCloseModal={handleCloseModal}
            handleSubmit={handleSubmit}
            isPending={isPending}
          />

          {/* Column 2: Contact Details */}
          <PersonalInfoCard
            title="Contact Details"
            fields={contactFields}
            onEditClick={handleEditClick}
            isFlipped={isContactFlipped}
            editField={editField}
            activeField={activeField}
            formVal={formVal}
            handleInputChange={handleInputChange}
            handleCloseModal={handleCloseModal}
            handleSubmit={handleSubmit}
            isPending={isPending}
          />

        </div>
      </div>

      {/* Profile Photo Lightbox Modal - Mounted to document.body using React Portal */}
      <ProfileLightbox
        isOpen={editField === 'profilePic'}
        user={user}
        selectedPreview={selectedPreview}
        isPending={isPending}
        getSafeAvatar={getSafeAvatar}
        handleCloseModal={handleCloseModal}
        handleFileChange={handleFileChange}
        handleSubmit={handleSubmit}
        rawImage={rawImage}
        setRawImage={setRawImage}
        zoom={zoom}
        setZoom={setZoom}
        position={position}
        setPosition={setPosition}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        dragStart={dragStart}
        setDragStart={setDragStart}
        imgRef={imgRef}
        cropImage={cropImage}
      />
    </div>
  );
}
