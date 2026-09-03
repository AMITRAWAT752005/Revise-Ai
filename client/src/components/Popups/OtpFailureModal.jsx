import React from 'react';
import styles from './OtpFailureModal.module.css';
import logoImg from '../../assets/images/book-logo.png';

const OtpFailureModal = ({ onClose, onResend }) => {
  const handleResend = () => {
    if (onResend) onResend();
    if (onClose) onClose();
  };

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

        <h3 className={styles.title}>Verification Failed</h3>
        <p className={styles.description}>
          The code you entered is incorrect or has expired. Please try again.
        </p>

        <div className={styles.actionsStack}>
          <button type="button" className={styles.tryAgainBtn} onClick={onClose}>
            Try Again
          </button>
          <button type="button" className={styles.resendBtn} onClick={handleResend}>
            Resend Code
          </button>
        </div>
      </div>
    </div>
  );
};

export default OtpFailureModal;
