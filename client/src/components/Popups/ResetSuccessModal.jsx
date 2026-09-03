import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ResetSuccessModal.module.css';

const ResetSuccessModal = ({ onClose }) => {
  const navigate = useNavigate();

  const handleBackToLogin = () => {
    if (onClose) onClose();
    navigate('/login');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrapper}>
          <div className={styles.iconCircle}>
            <span className="material-symbols-outlined">check_circle</span>
          </div>
        </div>
        <h2 className={styles.title}>Password Reset Successful</h2>
        <p className={styles.description}>
          Your password has been updated. Please log in with your new credentials.
        </p>
        <button type="button" className={styles.actionBtn} onClick={handleBackToLogin}>
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ResetSuccessModal;
