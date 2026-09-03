import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import styles from './Signup.module.css';
import AccountSuccessModal from '../../components/Popups/AccountSuccessModal';
import AccountFailureModal from '../../components/Popups/AccountFailureModal';

import logoImg from '../../assets/images/book-logo.png';
import illustrationImg from '../../assets/images/signup-illustration.png';

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [modalState, setModalState] = useState(null); // 'success' | 'failure' | null

  const togglePasswordVisibility = (e) => {
    e.preventDefault();
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = (e) => {
    e.preventDefault();
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (fullName && email && password && password === confirmPassword) {
      // Save new user into localStorage registeredUsers
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const userExists = existingUsers.some(u => u.email.trim().toLowerCase() === email.trim().toLowerCase());

      if (userExists) {
        setModalState('failure');
      } else {
        const updatedUsers = [...existingUsers, { fullName, email: email.trim(), password }];
        localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
        setModalState('success');
      }
    } else {
      setModalState('failure');
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.mainCard}>
        {/* Left Side: Branding / Illustration */}
        <div className={styles.leftSide}>
          <div className={styles.blobTop}></div>
          <div className={styles.blobBottom}></div>
          
          <div className={styles.contentZ}>
            <h1 className={styles.logoTitle}>
              <img src={logoImg} alt="ReviseAI Logo" className={styles.logoIcon} />
              ReviseAI
            </h1>
            <h2 className={styles.headline}>
              Unlock Your <br />
              <span>Flow State.</span>
            </h2>
            <p className={styles.subhead}>
              Experience AI-assisted breakthroughs in your study sessions. Gamified learning designed for deep focus.
            </p>
          </div>
          
          <div className={styles.illustration}>
            <img 
              src={illustrationImg} 
              alt="A highly abstract, 3D digital illustration representing a 'flow state' in learning." 
            />
          </div>
        </div>

        {/* Right Side: Form */}
        <div className={styles.rightSide}>
          <div className={styles.formWrapper}>
            <div className={styles.formHeader}>
              <h2 className={styles.formTitle}>Create an Account</h2>
              <p className={styles.formSubtitle}>Join ReviseAI and accelerate your learning.</p>
            </div>
            
            <button className={styles.googleBtn} type="button">
              <GoogleIcon />
              <span>Sign up with Google</span>
            </button>
            
            <div className={styles.divider}>
              <div className={styles.dividerLine}></div>
              <span className={styles.dividerText}>OR</span>
              <div className={styles.dividerLine}></div>
            </div>
            
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.inputGroup}>
                <label htmlFor="fullName">Full Name</label>
                <div className={styles.inputWrapper}>
                  <span className={`material-symbols-outlined ${styles.inputIcon}`}>person</span>
                  <input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="email">Email Address</label>
                <div className={styles.inputWrapper}>
                  <span className={`material-symbols-outlined ${styles.inputIcon}`}>mail</span>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="password">Password</label>
                <div className={styles.inputWrapper}>
                  <span className={`material-symbols-outlined ${styles.inputIcon}`}>lock</span>
                  <input 
                    id="password" 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button type="button" className={styles.togglePasswordBtn} onClick={togglePasswordVisibility}>
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
              
              <div className={styles.inputGroup}>
                <label htmlFor="confirmPassword">Confirm Password</label>
                <div className={styles.inputWrapper}>
                  <span className={`material-symbols-outlined ${styles.inputIcon}`}>lock</span>
                  <input 
                    id="confirmPassword" 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <button type="button" className={styles.togglePasswordBtn} onClick={toggleConfirmPasswordVisibility}>
                    <span className="material-symbols-outlined">
                      {showConfirmPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>
              
              <button type="submit" className={styles.submitBtn}>
                Create Account
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
              </button>
            </form>

            <div className={styles.footerText}>
              <p>
                Already have an account?{' '}
                <Link to="/login">Log in</Link>
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Pop Up Modals */}
      {modalState === 'success' && (
        <AccountSuccessModal onClose={() => setModalState(null)} />
      )}
      {modalState === 'failure' && (
        <AccountFailureModal onClose={() => setModalState(null)} />
      )}
    </div>
  );
};

export default Signup;
