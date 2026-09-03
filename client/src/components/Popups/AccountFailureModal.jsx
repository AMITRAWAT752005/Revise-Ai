import React from 'react';
import styles from './AccountFailureModal.module.css';
import logoImg from '../../assets/images/book-logo.png';

const AccountFailureModal = ({ onClose, title, message }) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.logoHeader}>
          <img src={logoImg} alt="ReviseAI Logo" className={styles.logoImg} />
        </div>
        <div className={styles.iconWrapper}>
          <div className={styles.iconCircle}>
            <span className="material-symbols-outlined">error</span>
          </div>
        </div>
        <h2 className={styles.title}>{title || 'Account Creation Failed'}</h2>
        <p className={styles.description}>
          {message || "We couldn't create your account. An account with this email address may already exist or the input data was invalid."}
        </p>
        <div className={styles.actionsStack}>
          <button type="button" className={styles.tryAgainBtn} onClick={onClose}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>refresh</span>
            Try Again
          </button>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountFailureModal;
