/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
import React from 'react';
import NextImage from 'next/image';
import styles from './ProfileIdentityDesktop.module.css';

const ProfileIdentityDesktop = ({ 
  admin, 
  formData, 
  handleChange, 
  handleSubmit, 
  isEditing, 
  setIsEditing,
  updateMutation,
  statusMsg
}) => {
  return (
    <div className={styles.profileCard}>
      <div className={styles.profileHeader}>
        <div className={styles.avatarWrapper}>
          <img 
            alt="Admin Avatar" 
            src="/admin-icon.png" 
            className={styles.largeAvatar}
          />
          <div className={styles.avatarGlow}></div>
        </div>
        <div className={styles.profileTitleInfo}>
          <h1>{admin.firstname} {admin.lastname}</h1>
          <div className={styles.roleBadge}>
             <NextImage src="/admin-images/verified_user.png" width={18} height={18} alt="Verified" />
             <span>System Administrator • Root Access</span>
          </div>
        </div>
        
        {!isEditing && (
            <button 
                className={styles.editBtn}
                onClick={() => setIsEditing(true)}
            >
                <NextImage src="/admin-images/edit_square.png" width={18} height={18} alt="Edit" />
                <span>Update Profile</span>
            </button>
        )}
      </div>

      {statusMsg.text && (
          <div className={`${styles.message} ${statusMsg.type === 'success' ? styles.successMsg : styles.errorMsg}`}>
              {statusMsg.text}
          </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
                <label>First Name</label>
                <input 
                    type="text" 
                    name="firstname"
                    className={styles.inputField}
                    value={formData.firstname}
                    onChange={handleChange}
                    required
                    disabled={!isEditing}
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Last Name</label>
                <input 
                    type="text" 
                    name="lastname"
                    className={styles.inputField}
                    value={formData.lastname}
                    onChange={handleChange}
                    disabled={!isEditing}
                />
            </div>
            <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                <label>Login ID (Unique Identifier)</label>
                <div className={styles.readonlyInput}>
                    <NextImage src="/admin-images/lock.png" width={18} height={18} alt="Secure" />
                    <input 
                        type="text" 
                        value={admin.loginid}
                        disabled
                    />
                </div>
            </div>
        </div>

        {isEditing && (
            <div className={styles.actionRow}>
                <button 
                    type="button"
                    className={styles.cancelBtn}
                    onClick={() => setIsEditing(false)}
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    className={styles.saveBtn}
                    disabled={updateMutation.isPending}
                >
                    {updateMutation.isPending ? 'Syncing...' : 'Save Profile'}
                </button>
            </div>
        )}
      </form>
    </div>
  );
};

export default ProfileIdentityDesktop;
