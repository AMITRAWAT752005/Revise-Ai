import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Login.module.css';
import LoginSuccessModal from '../../components/Popups/LoginSuccessModal';
import LoginFailureModal from '../../components/Popups/LoginFailureModal';

import logoImg from '../../assets/images/book-logo.png';
import illustrationImg from '../../assets/images/signup-illustration.png';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [modalState, setModalState] = useState(null); // 'success' | 'failure' | null

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleGoogleResponse = async ({ credential }) => {
    try {
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await response.json();

      if (!response.ok) {
        setModalState('failure');
        return;
      }

      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setModalState('success');
    } catch (error) {
      setModalState('failure');
    }
  };

  React.useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (clientId && window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleResponse,
      });
      window.google.accounts.id.renderButton(
        document.getElementById('googleSignInBtn'),
        { theme: 'outline', size: 'large', text: 'continue_with', width: '320' }
      );
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('authToken', data.token);
        // Optionally save user data
        localStorage.setItem('user', JSON.stringify(data.user));
        setModalState('success');
      } else {
        setModalState('failure');
      }
    } catch (err) {
      setModalState('failure');
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.mainWrapper}>
        {/* Left Side: Login Form */}
        <div className={styles.leftSide}>
          {/* Brand */}
          <div className={styles.brandHeader}>
            <img src={logoImg} alt="ReviseAI Logo" className={styles.logoImg} />
            <span className={styles.brandTitle}>ReviseAI</span>
          </div>

          {/* Header */}
          <div className={styles.headerText}>
            <h1 className={styles.title}>Welcome back</h1>
            <p className={styles.subtitle}>Continue your learning journey.</p>
          </div>

          {/* Card Container */}
          <div className={styles.card}>
            <span className={`material-symbols-outlined ${styles.sparkIcon}`}>auto_awesome</span>

            <form className={styles.form} onSubmit={handleSubmit}>
              {/* Email Field */}
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="email">Email</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="email"
                    type="email"
                    className={styles.input}
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="password">Password</label>
                <div className={styles.inputWrapper}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`${styles.input} ${styles.inputWithToggle}`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className={styles.toggleBtn}
                    onClick={togglePasswordVisibility}
                    aria-label="Toggle Password Visibility"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className={styles.forgotWrapper}>
                <Link to="/forgot-password" className={styles.forgotLink}>
                  Forgot Password?
                </Link>
              </div>

              {/* Submit Button */}
              <button type="submit" className={styles.submitBtn}>
                Log In
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
              </button>
            </form>

            <div className={styles.divider}>
              <div className={styles.dividerLine}></div>
              <span className={styles.dividerText}>OR</span>
              <div className={styles.dividerLine}></div>
            </div>

            {/* Google Sign In */}
            <div id="googleSignInBtn" style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '1.5rem' }}></div>
          </div>

          <div className={styles.footerLinkText}>
            <p>
              Don't have an account? <Link to="/signup">Sign up</Link>
            </p>
          </div>
        </div>

        {/* Right Side: Visual Context (Desktop Only) */}
        <div className={styles.rightSide}>
          <img src={illustrationImg} alt="AI Learning Environment" className={styles.heroBg} />
          <div className={styles.overlayGradient}>
            <div className={styles.streakCard}>
              <div className={styles.badgeHeader}>
                <span className="material-symbols-outlined">bolt</span>
                <span className={styles.badgeTitle}>Daily Streak: 12 Days</span>
              </div>
              <p className={styles.streakQuote}>
                "Consistency is the architecture of success. Keep building."
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Pop Up Modals */}
      {modalState === 'success' && (
        <LoginSuccessModal onClose={() => setModalState(null)} />
      )}
      {modalState === 'failure' && (
        <LoginFailureModal onClose={() => setModalState(null)} />
      )}
    </div>
  );
};

export default Login;
