'use client';
import Image from 'next/image';
import styles from './PersonalInfoDesktop.module.css';

/**
 * Desktop View for Personal Info (width >= 1024)
 * Featuring glassmorphic panels and centered modal dialog forms.
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
  isPending
}) {
  return (
    <div className={styles.container}>
      <div className={styles.splitLayout}>
        {/* Left Side: Avatar Card */}
        {user && (
          <div className={styles.profileHero} onClick={() => handleEditClick('profilePic')}>
            <div className={styles.heroAvatar}>
              <Image 
                src={getSafeAvatar(user.profilePic)} 
                alt="Profile" 
                width={110} 
                height={110} 
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

        {/* Right Side: Credentials Details */}
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
                  <span className={styles.infoLabel}>{field.label}</span>
                  <span className={styles.infoValue}>{field.value}</span>
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
                  <span className={styles.infoLabel}>{field.label}</span>
                  <span className={styles.infoValue}>{field.value}</span>
                  {field.isEditable && <span className={styles.editArrow}>›</span>}
                </div>
              ))}
            </div>
          </div>

        </section>
      </div>

      {/* 🖥️ Centered Modal Dialog Overlay */}
      {editField && (
        <div className={styles.modalOverlay} onClick={handleCloseModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            
            <div className={styles.modalHeader}>
              <div>
                <h3 className={styles.modalTitle}>
                  {editField === 'name' ? 'Edit Name' :
                   editField === 'dob' ? 'Edit Birthday' :
                   editField === 'gender' ? 'Edit Gender' :
                   editField === 'recoveryEmail' ? 'Edit Recovery Email' :
                   editField === 'profilePic' ? 'Change Photo' : ''}
                </h3>
                <p className={styles.modalSubtitle}>
                  {editField === 'profilePic' 
                    ? 'Upload a custom avatar. Real-time preview is shown below.'
                    : 'Changes will sync instantly across all Cloud-Base services.'}
                </p>
              </div>
              <button className={styles.modalCloseBtn} onClick={handleCloseModal}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm}>
              
              {/* Profile Image Upload */}
              {editField === 'profilePic' && (
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
                    id="avatarInputDesktop" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                    className={styles.hiddenInput}
                  />
                  
                  <button 
                    type="button" 
                    onClick={() => document.getElementById('avatarInputDesktop').click()} 
                    className={styles.uploadTriggerBtn}
                  >
                    Choose Photo
                  </button>
                </div>
              )}

              {/* Name Fields */}
              {editField === 'name' && (
                <div className={styles.fieldBody}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>First Name</label>
                    <input 
                      type="text" 
                      name="firstName" 
                      value={formVal.firstName || ''} 
                      onChange={handleInputChange} 
                      className={styles.inputField}
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Last Name</label>
                    <input 
                      type="text" 
                      name="lastName" 
                      value={formVal.lastName || ''} 
                      onChange={handleInputChange} 
                      className={styles.inputField}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Birthday Date Picker */}
              {editField === 'dob' && (
                <div className={styles.fieldBody}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Date of Birth</label>
                    <input 
                      type="date" 
                      name="dob" 
                      value={formVal.dob || ''} 
                      onChange={handleInputChange} 
                      className={styles.inputField}
                      required
                    />
                  </div>
                </div>
              )}

              {/* Gender Selector */}
              {editField === 'gender' && (
                <div className={styles.fieldBody}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Gender</label>
                    <select 
                      name="gender" 
                      value={formVal.gender || 'Not selected'} 
                      onChange={handleInputChange} 
                      className={styles.selectField}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                      <option value="Not selected">Not selected</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Recovery Email Input */}
              {editField === 'recoveryEmail' && (
                <div className={styles.fieldBody}>
                  <div className={styles.inputGroup}>
                    <label className={styles.inputLabel}>Recovery Email Address</label>
                    <input 
                      type="email" 
                      name="recoveryEmail" 
                      value={formVal.recoveryEmail || ''} 
                      onChange={handleInputChange} 
                      className={styles.inputField}
                      placeholder="name@example.com"
                      required
                    />
                  </div>
                </div>
              )}

              <div className={styles.modalActions}>
                <button type="button" className={styles.btnSecondary} onClick={handleCloseModal}>
                  Cancel
                </button>
                <button type="submit" className={styles.btnPrimary} disabled={isPending}>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
