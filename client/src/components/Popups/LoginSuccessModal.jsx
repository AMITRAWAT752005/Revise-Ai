import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './LoginSuccessModal.module.css';
import logoImg from '../../assets/images/book-logo.png';

const LoginSuccessModal = ({ onClose }) => {
  const navigate = useNavigate();

  const handleContinue = () => {
    if (onClose) onClose();
    const userStr = localStorage.getItem('user');
    let destination = '/home'; // Default destination
    
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.commitmentPending) {
          destination = '/commitment';
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }
    
    navigate(destination);
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
        <h2 className={styles.title}>Login Successful</h2>
        <p className={styles.description}>
          Welcome back! You have successfully logged into ReviseAI.
        </p>
        <button type="button" className={styles.actionBtn} onClick={handleContinue}>
          <span>Continue to Dashboard</span>
          <span className="material-symbols-outlined">dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default LoginSuccessModal;
