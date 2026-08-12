/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import Image from 'next/image';
import BottomSheet from '@/components/UI/BottomSheet/BottomSheet';
import FormInput from '../UI/FormInput/FormInput';
import FormSelect from '../UI/FormSelect/FormSelect';
import KeyValueList from '@/components/UI/List/KeyValueList';
import AvatarCropper from '@/components/UI/Cropper/AvatarCropper';
import styles from './PersonalInfoMobile.module.css';

/**
 * Mobile View for Personal Info (width < 768)
 * Optimized for portrait mobile screens with stacked details and clean BottomSheet drawer overlays.
 */
export default function PersonalInfoMobile({
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
  cropImage,
  isLandscape,
  constrainPosition
}) {
  return (
    <div className={styles.container}>
      <div className={styles.mobileLayout}>
        {/* Profile Avatar Hero */}
        {user && (
          <div className={styles.profileHero}>
            <div className={styles.heroAvatar} onClick={() => handleEditClick('profilePic')}>
              <img 
                src={getSafeAvatar(user.profilePic)} 
                alt="Profile" className={styles.avatarImg}
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/user-icon.png'; }}
              />
            </div>
            <div className={styles.heroText}>
              <h2>{user.firstName} {user.lastName}</h2>
              <span>Account Owner</span>
            </div>
          </div>
        )}

        {/* Card Sections */}
        <section className={styles.section}>
          <KeyValueList 
            title="Basic Info" 
            fields={infoFields} 
            onEditClick={handleEditClick} 
          />
          <KeyValueList 
            title="Contact Details" 
            fields={contactFields} 
            onEditClick={handleEditClick} 
          />
        </section>
      </div>

      {/* 📱 Bottom Sheet Modal Drawer */}
      <BottomSheet
        isOpen={!!editField}
        onClose={handleCloseModal}
        title={
          editField === 'username' ? 'Edit Username' :
          editField === 'name' ? 'Edit Name' :
          editField === 'dob' ? 'Edit Birthday' :
          editField === 'gender' ? 'Edit Gender' :
          editField === 'recoveryEmail' ? 'Edit Recovery Email' :
          editField === 'profilePic' ? 'Change Photo' : ''
        }
        subtitle={
          editField === 'profilePic'
            ? (rawImage ? "Drag to center and use slider to zoom." : "Upload a custom avatar picture. Real-time preview is shown below.")
            : "Changes will sync instantly across all Nothing Box services."
        }
        onSubmit={handleSubmit}
        isPending={isPending}
        showActions={editField === 'profilePic' ? !rawImage : true}
      >
        {editField === 'profilePic' ? (
          rawImage ? (
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
            <div className={styles.avatarUploadGroup}>
              <div className={styles.uploadPreview}>
                <img 
                  src={selectedPreview || getSafeAvatar(user?.profilePic)} 
                  alt="Avatar Preview" 
                  className={styles.largePreviewImg}
                  onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/user-icon.png'; }}
                />
              </div>
              
              <input 
                type="file" 
                id="avatarInputMobile" 
                accept="image/*" 
                onChange={handleFileChange} 
                className={styles.hiddenInput}
              />
              
              <button 
                type="button" 
                onClick={() => document.getElementById('avatarInputMobile').click()} 
                className={styles.uploadTriggerBtn}
              >
                Choose Photo
              </button>
            </div>
          )
        ) : (
          <div className={styles.inputGroupContainer}>
            {editField === 'username' && (
              <FormInput
                label="Username"
                name="userName"
                value={formVal.userName}
                onChange={handleInputChange}
                required
              />
            )}

            {editField === 'name' && (
              <>
                <FormInput
                  label="First Name"
                  name="firstName"
                  value={formVal.firstName}
                  onChange={handleInputChange}
                  required
                />
                <FormInput
                  label="Last Name"
                  name="lastName"
                  value={formVal.lastName}
                  onChange={handleInputChange}
                  required
                />
              </>
            )}

            {editField === 'dob' && (
              <FormInput
                label="Date of Birth"
                type="date"
                name="dob"
                value={formVal.dob}
                onChange={handleInputChange}
                required
              />
            )}

            {editField === 'gender' && (
              <FormSelect
                label="Gender"
                name="gender"
                value={formVal.gender || 'Not selected'}
                onChange={handleInputChange}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                  { value: 'Not selected', label: 'Not selected' }
                ]}
              />
            )}

            {editField === 'recoveryEmail' && (
              <FormInput
                label="Recovery Email"
                type="email"
                name="recoveryEmail"
                value={formVal.recoveryEmail}
                onChange={handleInputChange}
                placeholder="name@example.com"
                required
              />
            )}
          </div>
        )}
      </BottomSheet>
    </div>
  );
}
