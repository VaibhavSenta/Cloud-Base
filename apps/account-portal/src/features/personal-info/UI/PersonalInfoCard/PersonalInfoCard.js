'use client';
import PersonalInfoCardFront from './Front/PersonalInfoCardFront';
import PersonalInfoCardBack from './Back/PersonalInfoCardBack';
import styles from './PersonalInfoCard.module.css';

/**
 * PersonalInfoCard component with premium aesthetics and integrated 3D flipping.
 * Coordinates rendering of modular PersonalInfoCardFront and PersonalInfoCardBack subcomponents.
 */
export default function PersonalInfoCard({
  title,
  fields,
  onEditClick,
  isFlipped,
  editField,
  activeField,
  formVal,
  handleInputChange,
  handleCloseModal,
  handleSubmit,
  isPending
}) {
  return (
    <div className={`${styles.cardWrapper} ${isFlipped ? styles.flipped : ''}`}>
      <div className={`${styles.cardInner} ${isFlipped ? styles.flipped : ''}`}>
        
        {/* FRONT FACE */}
        <PersonalInfoCardFront 
          title={title} 
          fields={fields} 
          onEditClick={onEditClick} 
          isFlipped={isFlipped}
        />

        {/* BACK FACE (EDIT FORM) */}
        <PersonalInfoCardBack
          activeField={activeField}
          formVal={formVal}
          handleInputChange={handleInputChange}
          handleCloseModal={handleCloseModal}
          handleSubmit={handleSubmit}
          isPending={isPending}
          isFlipped={isFlipped}
        />

      </div>
    </div>
  );
}
