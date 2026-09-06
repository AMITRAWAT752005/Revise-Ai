import React from 'react';
import styles from './SubjectErrorModal.module.css';

const SubjectErrorModal = ({ isOpen, onRetry, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modalWrapper}>
        <div className={styles.modalContainer}>
          {/* Error Icon */}
          <div className={styles.errorIconContainer}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', color: '#ba1a1a', fontVariationSettings: "'FILL' 1" }}>
              error
            </span>
          </div>

          {/* Content */}
          <h2 className={styles.title}>Something went wrong</h2>
          <p className={styles.description}>
            We couldn't create your subject right now. Please check your connection and try again.
          </p>

          {/* Actions */}
          <div className={styles.actions}>
            <button className={styles.retryBtn} onClick={onRetry}>
              Try Again
            </button>
            <button className={styles.cancelBtn} onClick={onCancel}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubjectErrorModal;
