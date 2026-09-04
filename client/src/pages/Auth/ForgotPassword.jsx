import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './ForgotPassword.module.css';

import logoImg from '../../assets/images/book-logo.png';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    try {
      await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), purpose: 'PASSWORD_RESET' }),
      });
      
      // Store email for OTP page fallback, then redirect to OTP verification
      localStorage.setItem('pendingVerificationEmail', email.trim());
      navigate('/verify-otp', { state: { email: email.trim(), context: 'password-reset' } });
    } catch (error) {
      setSubmitted(false);
      // Handle error visually if needed
    }
  };

  return (
    <div className={styles.container}>
      {/* Background Orbs */}
      <div className={styles.bgBlobTop}></div>
      <div className={styles.bgBlobBottom}></div>

      {/* Header */}
      <header className={styles.header}>
        <Link to="/login" className={styles.brandLink}>
          <img src={logoImg} alt="ReviseAI Logo" className={styles.logoImg} />
          ReviseAI
        </Link>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.card}>
          <div className={styles.iconHeader}>
            <div className={styles.iconBadge}>
              <span className="material-symbols-outlined">lock_reset</span>
            </div>
            <h1 className={styles.title}>Forgot your password?</h1>
            <p className={styles.subtitle}>
              Enter your email and we'll send you a verification code to reset your password.
            </p>
          </div>

          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="email">Email</label>
              <div className={styles.inputWrapper}>
                <span className={`material-symbols-outlined ${styles.inputIcon}`}>mail</span>
                <input
                  id="email"
                  type="email"
                  className={styles.input}
                  placeholder="student@university.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button type="submit" className={styles.submitBtn} disabled={submitted}>
              <span className="material-symbols-outlined">send</span>
              {submitted ? "Sending OTP..." : "Send OTP"}
            </button>
          </form>

          <div className={styles.footerWrapper}>
            <Link to="/login" className={styles.backLink}>
              <span className="material-symbols-outlined">arrow_back</span>
              Back to Log In
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ForgotPassword;
