'use client';
import { useState, useEffect } from 'react';
import Card3D from '../UI/Card3D/Card3D';
import FormInput from '../UI/FormInput/FormInput';
import FormSelect from '../UI/FormSelect/FormSelect';
import FormButton from '../UI/FormButton/FormButton';
import ProfileBanner from '../UI/ProfileBanner/ProfileBanner';
import ProfileLightbox from '../UI/ProfileLightbox/ProfileLightbox';
import IdentityTrustCard from '../UI/IdentityTrustCard/IdentityTrustCard';
import KeyValueList from '@/components/UI/List/KeyValueList';
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

        {/* Row 2: 3-column lower section using 3D Flip Bento Cards */}
        <div className={styles.lowerSection}>
          
          {/* Column 1: Identity & Trust Status */}
          <IdentityTrustCard />

          {/* Column 2: Basic Profile Metadata */}
          <Card3D 
            isFlipped={isBasicFlipped}
            frontContent={(
              <>
                <h3 className={styles.cardTitle}>Basic Profile</h3>
                <KeyValueList fields={infoFields} onEditClick={handleEditClick} />
              </>
            )}
            backContent={(
              <div className={styles.backContent}>
                <h3 className={styles.backTitle}>
                  {activeField === 'username' ? 'Edit Username' :
                   activeField === 'name' ? 'Edit Name' :
                   activeField === 'dob' ? 'Edit Birthday' :
                   activeField === 'gender' ? 'Edit Gender' : ''}
                </h3>
                
                <form onSubmit={handleSubmit} className={styles.backForm}>
                  
                  {/* Username Field */}
                  {activeField === 'username' && (
                    <div className={styles.fieldBody}>
                      <FormInput
                        label="Username"
                        name="userName"
                        value={formVal.userName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}

                  {/* Name Fields */}
                  {activeField === 'name' && (
                    <div className={styles.fieldBody}>
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
                    </div>
                  )}

                  {/* Birthday Date Picker */}
                  {activeField === 'dob' && (
                    <div className={styles.fieldBody}>
                      <FormInput
                        label="Date of Birth"
                        type="date"
                        name="dob"
                        value={formVal.dob}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  )}

                  {/* Gender Selector */}
                  {activeField === 'gender' && (
                    <div className={styles.fieldBody}>
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
                    </div>
                  )}

                  <div className={styles.backActions}>
                    <FormButton variant="secondary" onClick={handleCloseModal}>
                      Cancel
                    </FormButton>
                    <FormButton type="submit" variant="primary" disabled={isPending}>
                      {isPending ? 'Saving...' : 'Save'}
                    </FormButton>
                  </div>
                </form>
              </div>
            )}
          />

          {/* Column 3: Contact Details */}
          <Card3D 
            isFlipped={isContactFlipped}
            frontContent={(
              <>
                <h3 className={styles.cardTitle}>Contact Details</h3>
                <KeyValueList fields={contactFields} onEditClick={handleEditClick} />
              </>
            )}
            backContent={(
              <div className={styles.backContent}>
                <h3 className={styles.backTitle}>Edit Recovery Email</h3>
                
                <form onSubmit={handleSubmit} className={styles.backForm}>
                  <div className={styles.fieldBody}>
                    <FormInput
                      label="Recovery Email Address"
                      type="email"
                      name="recoveryEmail"
                      value={formVal.recoveryEmail}
                      onChange={handleInputChange}
                      placeholder="name@example.com"
                      required
                    />
                  </div>

                  <div className={styles.backActions}>
                    <FormButton variant="secondary" onClick={handleCloseModal}>
                      Cancel
                    </FormButton>
                    <FormButton type="submit" variant="primary" disabled={isPending}>
                      {isPending ? 'Saving...' : 'Save'}
                    </FormButton>
                  </div>
                </form>
              </div>
            )}
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
