import React from 'react';
import styles from './SubjectSuccessModal.module.css';

const SubjectSuccessModal = ({ isOpen, onUploadMaterial, onSkip }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modalContainer}>
        {/* Top gradient accent */}
        <div className={styles.topAccent}></div>

        {/* Celebratory Graphic */}
        <div className={styles.celebrationGraphic}>
          <div className={styles.pulseRing}></div>
          <div className={styles.mainIconCircle}>
            <span className="material-symbols-outlined" style={{ fontSize: '40px', fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>
          {/* Confetti dots */}
          <div className={`${styles.confettiDot} ${styles.confetti1}`}></div>
          <div className={`${styles.confettiDot} ${styles.confetti2}`}></div>
          <div className={`${styles.confettiDot} ${styles.confetti3}`}></div>
          <div className={`${styles.confettiDot} ${styles.confetti4}`}></div>
        </div>

        {/* Title */}
        <h2 className={styles.title}>🎉 Subject created!</h2>
        <p className={styles.description}>
          Great! Now give ReviseAI some study material so it can build your personalized revision plan.
        </p>

        {/* Actions */}
        <div className={styles.actions}>
          <button className={styles.uploadBtn} onClick={onUploadMaterial}>
            <span className="material-symbols-outlined">upload_file</span>
            Upload Study Material
          </button>
          <button className={styles.skipBtn} onClick={onSkip}>
            I'll do this later
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubjectSuccessModal;
