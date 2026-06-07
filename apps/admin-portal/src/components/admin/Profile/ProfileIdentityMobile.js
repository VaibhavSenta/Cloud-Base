import React from 'react';
import NextImage from 'next/image';
import styles from './ProfileIdentityMobile.module.css';

const ProfileIdentityMobile = ({ 
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
    <div className={styles.mobileCard}>
      <div className={styles.header}>
        <div className={styles.avatarBox}>
          <img src="/admin-icon.png" alt="Admin" />
        </div>
        <div className={styles.titles}>
           <h3>{admin.firstname} {admin.lastname}</h3>
           <p>System Administrator</p>
        </div>
        {!isEditing && (
            <button className={styles.miniEditBtn} onClick={() => setIsEditing(true)}>
                <NextImage src="/admin-images/edit_square.png" width={18} height={18} alt="Edit" />
            </button>
        )}
      </div>

      {statusMsg.text && (
          <div className={`${styles.status} ${statusMsg.type === 'success' ? styles.success : styles.error}`}>
              {statusMsg.text}
          </div>
      )}

      <form className={styles.mobileForm} onSubmit={handleSubmit}>
        <div className={styles.formSection}>
            <div className={styles.inputGroup}>
                <label>First Name</label>
                <input 
                    type="text" 
                    name="firstname"
                    placeholder="Enter first name"
                    value={formData.firstname}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={styles.input}
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Last Name</label>
                <input 
                    type="text" 
                    name="lastname"
                    placeholder="Enter last name"
                    value={formData.lastname}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={styles.input}
                />
            </div>
        </div>

        <div className={styles.idSection}>
            <div className={styles.readonly}>
                <NextImage src="/admin-images/lock.png" width={14} height={14} alt="Lock" />
                <span className={styles.idText}>{admin.loginid}</span>
            </div>
        </div>

        {isEditing && (
            <div className={styles.actions}>
                <button type="button" className={styles.cancel} onClick={() => setIsEditing(false)}>Cancel</button>
                <button type="submit" className={styles.save} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? 'Saving...' : 'Sync Profile'}
                </button>
            </div>
        )}
      </form>
    </div>
  );
};

export default ProfileIdentityMobile;
