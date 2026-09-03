import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ResetPassword.module.css';
import ResetSuccessModal from '../../components/Popups/ResetSuccessModal';
import ResetFailureModal from '../../components/Popups/ResetFailureModal';

import logoImg from '../../assets/images/book-logo.png';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [modalState, setModalState] = useState(null); // 'success' | 'failure' | null

  // Password validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasSymbolOrNum = /[0-9!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  let strengthLevel = 'weak';
  if (hasMinLength && hasSymbolOrNum) {
    strengthLevel = 'strong';
  } else if (hasMinLength || hasSymbolOrNum) {
    strengthLevel = 'medium';
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword && confirmPassword && newPassword === confirmPassword && hasMinLength) {
      setModalState('success');
    } else {
      setModalState('failure');
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.mainWrapper}>
        <div className={styles.card}>
          <span className={`material-symbols-outlined ${styles.sparkIcon}`}>auto_awesome</span>

          <div className={styles.cardHeader}>
            <div className={styles.logoBadge}>
              <img src={logoImg} alt="ReviseAI Logo" className={styles.logoImg} />
            </div>
            <h1 className={styles.title}>Create a new password</h1>
            <p className={styles.subtitle}>
              Your new password must be unique from those previously used.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            {/* New Password Field */}
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="new_password">New Password</label>
              <div className={styles.inputWrapper}>
                <input
                  id="new_password"
                  type={showNewPassword ? "text" : "password"}
                  className={styles.input}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className={styles.toggleBtn}
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  aria-label="Toggle Password Visibility"
                >
                  <span className="material-symbols-outlined">
                    {showNewPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>

              {/* Password Strength Indicator */}
              {newPassword.length > 0 && (
                <div className={styles.strengthIndicator}>
                  <div className={styles.strengthBars}>
                    <div className={`${styles.bar} ${strengthLevel === 'weak' ? styles.barWeak : (strengthLevel === 'medium' ? styles.barMedium : styles.barStrong)}`}></div>
                    <div className={`${styles.bar} ${strengthLevel === 'medium' ? styles.barMedium : (strengthLevel === 'strong' ? styles.barStrong : '')}`}></div>
                    <div className={`${styles.bar} ${strengthLevel === 'strong' ? styles.barStrong : ''}`}></div>
                    <div className={`${styles.bar} ${strengthLevel === 'strong' ? styles.barStrong : ''}`}></div>
                  </div>

                  <p className={`${styles.strengthLabel} ${styles[strengthLevel]}`}>
                    {strengthLevel === 'weak' && "Weak password"}
                    {strengthLevel === 'medium' && "Medium strength password"}
                    {strengthLevel === 'strong' && "Strong password"}
                  </p>

                  <ul className={styles.requirementsList}>
                    <li className={`${styles.requirementItem} ${hasMinLength ? styles.validReq : styles.invalidReq}`}>
                      <span className="material-symbols-outlined">
                        {hasMinLength ? "check_circle" : "radio_button_unchecked"}
                      </span>
                      At least 8 characters
                    </li>
                    <li className={`${styles.requirementItem} ${hasSymbolOrNum ? styles.validReq : styles.invalidReq}`}>
                      <span className="material-symbols-outlined">
                        {hasSymbolOrNum ? "check_circle" : "radio_button_unchecked"}
                      </span>
                      Contains a number or symbol
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="confirm_password">Confirm Password</label>
              <div className={styles.inputWrapper}>
                <input
                  id="confirm_password"
                  type="password"
                  className={styles.input}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Submit Action */}
            <button type="submit" className={styles.submitBtn}>
              Reset Password
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </button>
          </form>

          <div className={styles.footerWrapper}>
            <Link to="/login" className={styles.backLink}>
              Back to Log In
            </Link>
          </div>
        </div>
      </main>

      {/* Pop Up Modals */}
      {modalState === 'success' && (
        <ResetSuccessModal onClose={() => setModalState(null)} />
      )}
      {modalState === 'failure' && (
        <ResetFailureModal onClose={() => setModalState(null)} />
      )}
    </div>
  );
};

export default ResetPassword;
