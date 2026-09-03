import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './OtpSuccessModal.module.css';
import logoImg from '../../assets/images/book-logo.png';

const OtpSuccessModal = ({ onClose, onContinue }) => {
  const navigate = useNavigate();

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else {
      if (onClose) onClose();
      navigate('/login');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.logoHeader}>
          <img src={logoImg} alt="ReviseAI Logo" className={styles.logoImg} />
        </div>

        <div className={styles.iconWrapper}>
          <div className={styles.iconCircle}>
            <span className="material-symbols-outlined">check</span>
          </div>
        </div>

        <h2 className={styles.title}>Verification Successful</h2>
        <p className={styles.description}>
          Your email has been verified. You're all set to start learning.
        </p>

        <button type="button" className={styles.continueBtn} onClick={handleContinue}>
          Continue to Dashboard
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default OtpSuccessModal;
