'use client';
import FormInput from '../../FormInput/FormInput';
import FormSelect from '../../FormSelect/FormSelect';
import FormButton from '../../FormButton/FormButton';
import styles from './PersonalInfoCardBack.module.css';

/**
 * PersonalInfoCardBack component rendering form fields based on activeField.
 */
export default function PersonalInfoCardBack({
  activeField,
  formVal,
  handleInputChange,
  handleCloseModal,
  handleSubmit,
  isPending,
  isFlipped
}) {
  return (
    <div className={`${styles.cardBack} ${isFlipped ? styles.active : ''}`}>
      <div className={styles.headerGroup}>
        <h3 className={styles.backTitle}>
          {activeField === 'username' ? 'Edit Username' :
           activeField === 'name' ? 'Edit Name' :
           activeField === 'dob' ? 'Edit Birthday' :
           activeField === 'gender' ? 'Edit Gender' :
           activeField === 'recoveryEmail' ? 'Edit Recovery Email' : 'Edit Details'}
        </h3>
        <p className={styles.backSubtitle}>
          {activeField === 'username' ? 'Choose a unique username to identify yourself on Nothing Box.' :
           activeField === 'name' ? 'Enter your legal first name and last name.' :
           activeField === 'dob' ? 'Provide your date of birth to complete account details verification.' :
           activeField === 'gender' ? 'Select your gender representation or choose not to set.' :
           activeField === 'recoveryEmail' ? 'Used to recover your access if your account is locked.' : 'Edit details of your account profile.'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className={styles.backForm}>
        <div className={styles.fieldBody}>
          
          {/* Username Field */}
          {activeField === 'username' && (
            <FormInput
              label="Username"
              name="userName"
              value={formVal.userName}
              onChange={handleInputChange}
              required
            />
          )}

          {/* Name Fields */}
          {activeField === 'name' && (
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

          {/* Birthday Date Picker */}
          {activeField === 'dob' && (
            <FormInput
              label="Date of Birth"
              type="date"
              name="dob"
              value={formVal.dob}
              onChange={handleInputChange}
              required
            />
          )}

          {/* Gender Selector */}
          {activeField === 'gender' && (
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

          {/* Recovery Email */}
          {activeField === 'recoveryEmail' && (
            <FormInput
              label="Recovery Email Address"
              type="email"
              name="recoveryEmail"
              value={formVal.recoveryEmail}
              onChange={handleInputChange}
              placeholder="name@example.com"
              required
            />
          )}

        </div>

        <div className={styles.backActions}>
          <FormButton type="button" variant="secondary" onClick={handleCloseModal}>
            Cancel
          </FormButton>
          <FormButton type="submit" variant="primary" disabled={isPending}>
            {isPending ? 'Saving...' : 'Save'}
          </FormButton>
        </div>
      </form>
    </div>
  );
}
