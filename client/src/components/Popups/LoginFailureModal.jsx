import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginFailureModal.module.css';
import logoImg from '../../assets/images/book-logo.png';

const LoginFailureModal = ({ onClose, isLocked = false }) => {
  const navigate = useNavigate();

  const handleCreateAccountClick = () => {
    if (onClose) onClose();
    navigate('/signup');
  };

  const handleForgotClick = () => {
    if (onClose) onClose();
    navigate('/forgot-password');
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
        <h2 className={styles.title}>Login Failed</h2>
        <p className={styles.description}>
          {isLocked
            ? 'Too many incorrect password attempts. For your security, please try again after 15 minutes.'
            : 'No account found with these credentials or the password was incorrect. Please create an account or check your credentials.'}
        </p>
        <div className={styles.actionsStack}>
          <button type="button" className={styles.createAccountBtn} onClick={handleCreateAccountClick}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person_add</span>
            Create an Account
          </button>
          <button type="button" className={styles.tryAgainBtn} onClick={onClose} disabled={isLocked}>
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>refresh</span>
            Try Again
          </button>
          <button type="button" className={styles.forgotBtn} onClick={handleForgotClick}>
            Forgot Password?
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginFailureModal;
