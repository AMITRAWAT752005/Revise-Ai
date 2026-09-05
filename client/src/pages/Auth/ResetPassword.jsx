import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './ResetPassword.module.css';
import ResetSuccessModal from '../../components/Popups/ResetSuccessModal';

import logoImg from '../../assets/images/book-logo.png';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [modalState, setModalState] = useState(null); // 'success' | null
  const [fieldErrors, setFieldErrors] = useState({});
  const [shakeFields, setShakeFields] = useState({});

  // Password validation checks
  const hasMinLength = newPassword.length >= 8;
  const hasSymbolOrNum = /[0-9!@#$%^&*(),.?":{}|<>]/.test(newPassword);

  let strengthLevel = 'weak';
  if (hasMinLength && hasSymbolOrNum) {
    strengthLevel = 'strong';
  } else if (hasMinLength || hasSymbolOrNum) {
    strengthLevel = 'medium';
  }

  const triggerShake = (fields) => {
    setShakeFields(fields);
    setTimeout(() => setShakeFields({}), 600);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    if (!newPassword) {
      errors.newPassword = 'Please enter a new password.';
    } else if (!hasMinLength) {
      errors.newPassword = 'Password must be at least 8 characters.';
    } else if (!hasSymbolOrNum) {
      errors.newPassword = 'Password must contain a number or symbol.';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Please confirm your password.';
    } else if (newPassword && confirmPassword !== newPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      triggerShake(
        Object.keys(errors).reduce((acc, key) => ({ ...acc, [key]: true }), {})
      );
      return;
    }

    setFieldErrors({});
    
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ newPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        setFieldErrors({ newPassword: data.error || 'Unable to reset password.' });
        return;
      }

      setModalState('success');
    } catch (err) {
      // Handle error
      console.error(err);
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
              <div className={`${styles.inputWrapper} ${shakeFields.newPassword ? styles.shake : ''}`}>
                <input
                  id="new_password"
                  type={showNewPassword ? "text" : "password"}
                  className={`${styles.input} ${fieldErrors.newPassword ? styles.inputError : ''}`}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (fieldErrors.newPassword) setFieldErrors(prev => ({ ...prev, newPassword: '' }));
                  }}
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
              {fieldErrors.newPassword && (
                <p className={styles.fieldError}>{fieldErrors.newPassword}</p>
              )}

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
              <div className={`${styles.inputWrapper} ${shakeFields.confirmPassword ? styles.shake : ''}`}>
                <input
                  id="confirm_password"
                  type="password"
                  className={`${styles.input} ${fieldErrors.confirmPassword ? styles.inputError : ''}`}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (fieldErrors.confirmPassword) setFieldErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  required
                />
              </div>
              {fieldErrors.confirmPassword && (
                <p className={styles.fieldError}>{fieldErrors.confirmPassword}</p>
              )}
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
    </div>
  );
};

export default ResetPassword;
