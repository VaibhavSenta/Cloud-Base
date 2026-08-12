/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';
import CloudSpinner from '@/components/UI/CloudSpinner/CloudSpinner';
import styles from './ServiceConsentCard.module.css';

/**
 * ServiceConsentCard Component — Onboarding & permissions consent card for connecting external services
 *
 * @param {string} name - Service name (e.g. 'Cloud Vault')
 * @param {string} description - Service description
 * @param {Array<string>} scopes - List of permission scope strings
 * @param {boolean} isPending - Loading state during connect mutation
 * @param {string} errorMessage - Optional error message
 * @param {function} onConnect - Primary action callback ('Accept & Connect')
 * @param {function} onCancel - Secondary action callback ('Cancel')
 */
export default function ServiceConsentCard({
  name,
  description,
  scopes = [],
  isPending = false,
  errorMessage = '',
  onConnect,
  onCancel
}) {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span className={styles.badge}>Service Onboarding</span>
        <h2 className={styles.title}>Link {name}</h2>
        <p className={styles.description}>{description}</p>
      </header>

      <div className={styles.divider}></div>

      <div className={styles.permissionsSection}>
        <h4 className={styles.permissionsHeading}>Permissions Requested</h4>
        <div className={styles.scopeList}>
          {scopes.map((scope, index) => (
            <div key={index} className={styles.scopeItem}>
              <span className={styles.bullet}>•</span>
              <span>{scope}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.divider}></div>

      <p className={styles.disclaimer}>
        By clicking Accept & Connect, you authorize Nothing Box to bridge your account tokens with {name} and share the metadata items listed above in accordance with the application privacy parameters.
      </p>

      {errorMessage && (
        <p className={styles.errorText}>{errorMessage}</p>
      )}

      {/* Actions Row — Fully Rounded Pill Buttons */}
      <div className={styles.actionGroup}>
        <button
          onClick={onConnect}
          disabled={isPending}
          className={styles.primaryBtn}
        >
          {isPending ? (
            <>
              <CloudSpinner size={16} />
              <span>Linking...</span>
            </>
          ) : (
            'Accept & Connect'
          )}
        </button>

        <button
          onClick={onCancel}
          disabled={isPending}
          className={styles.secondaryBtn}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
