import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './ResetFailureModal.module.css';

const ResetFailureModal = ({ onClose }) => {
  const navigate = useNavigate();

  const handleRequestNewLink = () => {
    if (onClose) onClose();
    navigate('/forgot-password');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.iconWrapper}>
          <div className={styles.iconCircle}>
            <span className="material-symbols-outlined">error</span>
          </div>
        </div>
        <h2 className={styles.title}>Reset Failed</h2>
        <p className={styles.description}>
          We couldn't reset your password. The link might be expired or invalid.
        </p>
        <div className={styles.actionsStack}>
          <button type="button" className={styles.requestLinkBtn} onClick={handleRequestNewLink}>
            Request New Link
          </button>
          <button type="button" className={styles.closeBtn} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetFailureModal;
