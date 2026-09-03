import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AccountSuccessModal.module.css';
import logoImg from '../../assets/images/book-logo.png';

const AccountSuccessModal = ({ onClose }) => {
  const navigate = useNavigate();

  const handleGoToLogin = () => {
    if (onClose) onClose();
    navigate('/login');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.logoHeader}>
          <img src={logoImg} alt="ReviseAI Logo" className={styles.logoImg} />
        </div>
        <div className={styles.iconWrapper}>
          <div className={styles.iconCircle}>
            <span className="material-symbols-outlined">check_circle</span>
          </div>
        </div>
        <h2 className={styles.title}>Account Created Successfully</h2>
        <p className={styles.description}>
          Your account has been created and verified! You're all set to start your AI-powered learning journey.
        </p>
        <button type="button" className={styles.actionBtn} onClick={handleGoToLogin}>
          <span>Log In to Your Account</span>
          <span className="material-symbols-outlined">arrow_forward</span>
        </button>
      </div>
    </div>
  );
};

export default AccountSuccessModal;
