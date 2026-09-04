import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './OTPVerification.module.css';
import OtpSuccessModal from '../../components/Popups/OtpSuccessModal';
import OtpFailureModal from '../../components/Popups/OtpFailureModal';
import logoImg from '../../assets/images/book-logo.png';

const OTPVerification = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const email = location.state?.email || localStorage.getItem('pendingVerificationEmail') || '';
  const context = location.state?.context || 'registration'; // 'registration' | 'password-reset'

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [modalState, setModalState] = useState(null); // 'success' | 'failure' | null
  const [resendCooldown, setResendCooldown] = useState(0);
  const [toastMessage, setToastMessage] = useState('');
  const inputRefs = useRef([]);

  useEffect(() => {
    // Auto focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (index, value) => {
    const sanitizedValue = value.replace(/[^0-9]/g, '');
    if (!sanitizedValue && value !== '') return;

    const newOtp = [...otp];
    newOtp[index] = sanitizedValue.slice(-1); // Take last typed digit
    setOtp(newOtp);

    // Auto-advance to next input if filled
    if (sanitizedValue && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1].focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/[^0-9]/g, '').slice(0, 6);
    if (!pastedData) return;

    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);

    // Focus the box after the last pasted digit
    const nextIndex = Math.min(pastedData.length, 5);
    if (inputRefs.current[nextIndex]) {
      inputRefs.current[nextIndex].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    
    if (code.length < 6) {
      setModalState('failure');
      return;
    }

    try {
      const purpose = context === 'password-reset' ? 'PASSWORD_RESET' : 'ACCOUNT_VERIFICATION';
      const response = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp: code, purpose }),
      });

      const data = await response.json();

      if (!response.ok) {
        setModalState('failure');
        return;
      }

      // On successful registration OTP, store the token and set commitment flag
      if (context === 'registration' && data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('commitmentPending', 'true');
      }

      setModalState('success');
    } catch (err) {
      setModalState('failure');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    
    try {
      const purpose = context === 'password-reset' ? 'PASSWORD_RESET' : 'ACCOUNT_VERIFICATION';
      await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose }),
      });
      
      setResendCooldown(30);
      setToastMessage('A new 6-digit verification code has been sent to your email!');
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
      setTimeout(() => {
        setToastMessage('');
      }, 4000);
    } catch (err) {
      setToastMessage('Failed to resend OTP. Please try again.');
      setTimeout(() => setToastMessage(''), 4000);
    }
  };

  return (
    <div className={styles.container}>
      <main className={styles.mainCard}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.logoBadge}>
            <img src={logoImg} alt="ReviseAI Logo" className={styles.logoImg} />
          </div>
          <h1 className={styles.brandTitle}>ReviseAI</h1>
        </div>

        {/* Content Card */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>Verify your email</h2>
          <p className={styles.cardSubtitle}>
            We've sent a 6-digit verification code to{' '}
            {email ? <strong>{email}</strong> : 'your email address'}.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            {/* OTP Inputs */}
            <div className={styles.otpRow}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  aria-label={`Digit ${index + 1}`}
                  className={`${styles.otpInput} ${digit ? styles.otpInputFilled : ''}`}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                />
              ))}
            </div>

            {/* Primary Action */}
            <button type="submit" className={styles.submitBtn}>
              Verify
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
            </button>
          </form>

          {/* Resend Link */}
          <div className={styles.resendWrapper}>
            <p className={styles.resendText}>
              Didn't receive the code?{' '}
              <button
                type="button"
                className={`${styles.resendBtn} ${resendCooldown > 0 ? styles.resendBtnDisabled : ''}`}
                onClick={handleResend}
                disabled={resendCooldown > 0}
              >
                {resendCooldown > 0 ? `Resend OTP (${resendCooldown}s)` : 'Resend OTP'}
              </button>
            </p>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toastMessage && (
        <div className={styles.toast}>
          {toastMessage}
        </div>
      )}

      {/* Pop Up Modals */}
      {modalState === 'success' && (
        <OtpSuccessModal
          onClose={() => navigate(context === 'password-reset' ? '/reset-password' : '/commitment')}
          description={
            context === 'password-reset'
              ? 'Your identity has been verified. You can now create a new password.'
              : "Your email has been verified. You're all set to start your commitment."
          }
          btnLabel={context === 'password-reset' ? 'Continue to Reset Password' : 'Continue to Commitment'}
        />
      )}
      {modalState === 'failure' && (
        <OtpFailureModal onClose={() => setModalState(null)} onResend={handleResend} />
      )}
    </div>
  );
};

export default OTPVerification;
