import React, { useState, useRef, useEffect } from 'react';
import styles from './OTPVerification.module.css';
import OtpSuccessModal from '../../components/Popups/OtpSuccessModal';
import OtpFailureModal from '../../components/Popups/OtpFailureModal';
import logoImg from '../../assets/images/book-logo.png';

const OTPVerification = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const code = otp.join('');
    
    if (code.length < 6) {
      setModalState('failure');
      return;
    }

    // Demo check: '000000' or '111111' triggers failure modal, all other 6-digit codes succeed
    if (code === '000000' || code === '111111') {
      setModalState('failure');
    } else {
      localStorage.setItem('isVerified', 'true');
      setModalState('success');
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    setToastMessage('A new 6-digit verification code has been sent to your email!');
    setOtp(['', '', '', '', '', '']);
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
    setTimeout(() => {
      setToastMessage('');
    }, 4000);
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
            We've sent a 6-digit verification code to your email address.
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
        <OtpSuccessModal onClose={() => setModalState(null)} />
      )}
      {modalState === 'failure' && (
        <OtpFailureModal onClose={() => setModalState(null)} onResend={handleResend} />
      )}
    </div>
  );
};

export default OTPVerification;
