import React, { useState } from 'react';
import styles from './CreateSubjectModal.module.css';

const CreateSubjectModal = ({ isOpen, onClose, onSubmit, errorMessage = '', isSubmitting = false }) => {
  const [subjectName, setSubjectName] = useState('');
  const [description, setDescription] = useState('');
  const [theme, setTheme] = useState('indigo');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const succeeded = onSubmit ? await onSubmit({ name: subjectName, description, theme }) : true;
    if (succeeded === false) return;
    // Reset state after submission
    setSubjectName('');
    setDescription('');
    setTheme('indigo');
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div 
        className={styles.modalContainer}
        role="dialog" 
        aria-modal="true" 
        aria-labelledby="modal-title"
      >
        <div className={styles.aiSparkleBorder}></div>
        
        <div className={styles.modalContent}>
          <div className={styles.modalHeader}>
            <div>
              <div className={styles.iconBox}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  menu_book
                </span>
              </div>
              <h2 id="modal-title" className={styles.modalTitle}>
                Create Your First Subject
              </h2>
              <p className={styles.modalSubtitle}>
                Let's get your learning journey started. Set up your core area of study.
              </p>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          <form className={styles.formGroup} onSubmit={handleSubmit}>
            <div className={styles.fieldGroup}>
              <label htmlFor="subject-name" className={styles.fieldLabel}>
                Subject Name <span className={styles.requiredStar}>*</span>
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIcon}>
                  <span className="material-symbols-outlined">title</span>
                </div>
                <input
                  id="subject-name"
                  type="text"
                  className={styles.textInput}
                  placeholder="e.g., Computer Networks"
                  required
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label htmlFor="subject-desc" className={styles.fieldLabelFlex}>
                Description
                <span className={styles.optionalText}>(Optional)</span>
              </label>
              <div className={styles.inputWrapper}>
                <div className={styles.inputIconTop}>
                  <span className="material-symbols-outlined">notes</span>
                </div>
                <textarea
                  id="subject-desc"
                  className={styles.textAreaInput}
                  placeholder="What core concepts will you master here?"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className={styles.themeSection}>
              <label className={styles.fieldLabel}>Subject Theme</label>
              <div className={styles.themeOptions}>
                <button
                  type="button"
                  aria-label="Select Indigo theme"
                  className={`${styles.themeBtn} ${styles.themeIndigo} ${theme === 'indigo' ? styles.themeSelected : ''}`}
                  onClick={() => setTheme('indigo')}
                ></button>
                <button
                  type="button"
                  aria-label="Select Teal theme"
                  className={`${styles.themeBtn} ${styles.themeTeal} ${theme === 'teal' ? styles.themeSelected : ''}`}
                  onClick={() => setTheme('teal')}
                ></button>
                <button
                  type="button"
                  aria-label="Select Purple theme"
                  className={`${styles.themeBtn} ${styles.themePurple} ${theme === 'purple' ? styles.themeSelected : ''}`}
                  onClick={() => setTheme('purple')}
                ></button>
              </div>
            </div>
            {errorMessage && <p className={styles.formError}>{errorMessage}</p>}
          </form>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.cancelBtn} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={styles.submitBtn} onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? <span className={styles.spinner} /> : <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>}
            {isSubmitting ? 'Creating...' : 'Create Subject'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateSubjectModal;
