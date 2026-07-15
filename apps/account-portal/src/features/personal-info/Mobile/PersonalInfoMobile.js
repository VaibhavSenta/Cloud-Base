'use client';
import Image from 'next/image';
import BottomSheet from '@/components/UI/BottomSheet/BottomSheet';
import FormInput from '../UI/FormInput/FormInput';
import FormSelect from '../UI/FormSelect/FormSelect';
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
  isLandscape
}) {
  return (
    <div className={styles.container}>
      <div className={styles.mobileLayout}>
        {/* Profile Avatar Hero */}
        {user && (
          <div className={styles.profileHero}>
            <div className={styles.heroAvatar} onClick={() => handleEditClick('profilePic')}>
              <Image 
                src={getSafeAvatar(user.profilePic)} 
                alt="Profile" 
                width={80} 
                height={80} 
                className={styles.avatarImg}
                priority
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
          
          {/* Card 1: Basic Info */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Basic Info</h3>
            <div className={styles.infoList}>
              {infoFields.map((field, idx) => (
                <div 
                  key={idx} 
                  className={`${styles.infoItem} ${!field.isEditable ? styles.nonEditable : ''}`}
                  onClick={field.isEditable ? () => handleEditClick(field.key) : undefined}
                >
                  <div className={styles.rowMeta}>
                    <span className={styles.infoLabel}>{field.label}</span>
                    <span className={styles.infoValue}>{field.value}</span>
                  </div>
                  {field.isEditable && <span className={styles.editArrow}>›</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Card 2: Contact Details */}
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Contact Details</h3>
            <div className={styles.infoList}>
              {contactFields.map((field, idx) => (
                <div 
                  key={idx} 
                  className={`${styles.infoItem} ${!field.isEditable ? styles.nonEditable : ''}`}
                  onClick={field.isEditable ? () => handleEditClick(field.key) : undefined}
                >
                  <div className={styles.rowMeta}>
                    <span className={styles.infoLabel}>{field.label}</span>
                    <span className={styles.infoValue}>{field.value}</span>
                  </div>
                  {field.isEditable && <span className={styles.editArrow}>›</span>}
                </div>
              ))}
            </div>
          </div>

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
            : "Changes will sync instantly across all Cloud-Base services."
        }
        onSubmit={handleSubmit}
        isPending={isPending}
        showActions={editField === 'profilePic' ? !rawImage : true}
      >
        {editField === 'profilePic' ? (
          rawImage ? (
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

              {/* Action buttons inside the modal for crop operations */}
              <div className={styles.cropperActions}>
                <button 
                  type="button" 
                  onClick={() => setRawImage(null)} 
                  className={styles.cancelCropBtn}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  onClick={cropImage} 
                  className={styles.applyCropBtn}
                >
                  Apply Crop
                </button>
              </div>
            </div>
          ) : (
            <div className={styles.avatarUploadGroup}>
              <div className={styles.uploadPreview}>
                <Image 
                  src={selectedPreview || getSafeAvatar(user?.profilePic)} 
                  alt="Avatar Preview" 
                  width={120} 
                  height={120} 
                  className={styles.largePreviewImg}
                  priority
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
