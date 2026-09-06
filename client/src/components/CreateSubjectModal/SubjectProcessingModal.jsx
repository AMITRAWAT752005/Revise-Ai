import React from 'react';
import styles from './SubjectProcessingModal.module.css';

const SubjectProcessingModal = ({ isOpen, onCancel, currentStep = 3 }) => {
  if (!isOpen) return null;

  const steps = [
    { label: 'Reading your documents', status: currentStep > 0 ? 'done' : currentStep === 0 ? 'active' : 'pending' },
    { label: 'Finding chapters', status: currentStep > 1 ? 'done' : currentStep === 1 ? 'active' : 'pending' },
    { label: 'Identifying important topics', status: currentStep > 2 ? 'done' : currentStep === 2 ? 'active' : 'pending' },
    { label: 'Building your knowledge map', status: currentStep > 3 ? 'done' : currentStep === 3 ? 'active' : 'pending' },
    { label: 'Preparing revision questions', status: currentStep > 4 ? 'done' : currentStep === 4 ? 'active' : 'pending' },
  ];

  const progressPercent = Math.min(((currentStep + 1) / steps.length) * 100, 100);

  return (
    <div className={styles.overlay}>
      <main className={styles.modalWrapper}>
        <div className={styles.modalContainer}>
          {/* Illustration */}
          <div className={styles.illustrationBox}>
            <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#5e5ce6', fontVariationSettings: "'FILL' 1" }}>
              auto_awesome
            </span>
          </div>

          {/* Title */}
          <h1 className={styles.title}>
            ReviseAI is learning your material... ✨
          </h1>

          {/* Processing Checklist */}
          <div className={styles.checklist}>
            {steps.map((step, idx) => (
              <div 
                key={idx} 
                className={`${styles.stepRow} ${step.status === 'active' ? styles.stepActive : ''} ${step.status === 'pending' ? styles.stepPending : ''}`}
              >
                {step.status === 'done' && (
                  <span className="material-symbols-outlined" style={{ color: '#16a34a', fontVariationSettings: "'FILL' 1" }}>
                    check_circle
                  </span>
                )}
                {step.status === 'active' && (
                  <div className={styles.spinnerContainer}>
                    <span className="material-symbols-outlined" style={{ color: '#4441cc' }}>
                      radio_button_checked
                    </span>
                    <div className={styles.spinner}></div>
                  </div>
                )}
                {step.status === 'pending' && (
                  <span className="material-symbols-outlined" style={{ color: '#777586' }}>
                    radio_button_unchecked
                  </span>
                )}
                <span className={`${styles.stepLabel} ${step.status === 'active' ? styles.stepLabelActive : ''}`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className={styles.progressTrack}>
            <div className={styles.progressFill} style={{ width: `${progressPercent}%` }}></div>
          </div>

          {/* Cancel Button */}
          <button className={styles.cancelBtn} onClick={onCancel}>
            Cancel Processing
          </button>
        </div>
      </main>
    </div>
  );
};

export default SubjectProcessingModal;
