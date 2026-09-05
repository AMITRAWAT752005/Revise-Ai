import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Commitment.module.css';

const Commitment = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [studentType, setStudentType] = useState('College Student');
  const [timePerDay, setTimePerDay] = useState('30 min');
  const [flashcards, setFlashcards] = useState('20');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    let isPending = localStorage.getItem('commitmentPending') === 'true';

    if (userStr && !isPending) {
      try {
        const user = JSON.parse(userStr);
        if (user.commitmentPending === true) {
          isPending = true;
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }

    // Only allow new users with pending commitment
    if (!isPending) {
      navigate('/login');
      return;
    }

    // Pre-fill name if we have a pending user
    const email = localStorage.getItem('pendingVerificationEmail');
    if (email) {
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const currentUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (currentUser && currentUser.fullName) {
        setName(currentUser.fullName.split(' ')[0]); // Use first name
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('authToken');
      await fetch('/api/auth/commitment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ studentType, timePerDay, flashcards }),
      });
      
      localStorage.removeItem('commitmentPending');
      // Adding a small delay for the animation effect
      setTimeout(() => {
        navigate('/home');
      }, 1000);
    } catch (err) {
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Floating Decorations */}
      <div className={styles.decorationsWrapper}>
        <div className={styles.decorationsInner}>
          {/* Star 1 */}
          <svg className={`${styles.iconBase} ${styles.iconStar} ${styles.float1}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
          </svg>
          {/* Book */}
          <svg className={`${styles.iconBase} ${styles.iconBook} ${styles.float2}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M4 19V5c0-1.1.9-2 2-2h13v14H6c-1.1 0-2 .9-2 2s.9 2 2 2h12v-2H6v-2h12v-2H4z"></path>
          </svg>
          {/* Grad Cap */}
          <svg className={`${styles.iconBase} ${styles.iconCap} ${styles.float4}`} fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72l5 2.73 5-2.73v3.72z"></path>
          </svg>
        </div>
      </div>

      <main className={styles.mainWrapper}>
        <div className={`${styles.card} ${styles.animateEntrance}`}>
          {/* Header Section */}
          <div className={styles.headerSection}>
            <h1 className={styles.title}>
              ✨ MY REVISION COMMITMENT ✨
            </h1>
            <p className={styles.subtitle}>
              Small promises. Consistent effort. Big results.
            </p>
          </div>

          {/* Madlib Content */}
          <form onSubmit={handleSubmit}>
            <div className={styles.madlibContent}>
              Today, I, 
              <input 
                aria-label="Your Name" 
                className={`${styles.pillInput} ${styles.nameInput}`} 
                placeholder="Your Name" 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ width: Math.max(100, (name.length * 12) + 40) + 'px' }}
                required
              />, 
              make a promise to my future self. As a proud 
              <select 
                aria-label="Student Type" 
                className={styles.pillInput}
                value={studentType}
                onChange={(e) => setStudentType(e.target.value)}
              >
                <option>College Student</option>
                <option>School Student</option>
                <option>Professional</option>
              </select>, 
              I will dedicate at least 
              <select 
                aria-label="Time per day" 
                className={styles.pillInput}
                value={timePerDay}
                onChange={(e) => setTimePerDay(e.target.value)}
              >
                <option>15 min</option>
                <option>30 min</option>
                <option>45 min</option>
                <option>1 hour</option>
                <option>2 hours</option>
              </select> 
              every day to my studies, completing at least 
              <select 
                aria-label="Flashcards per session" 
                className={styles.pillInput}
                value={flashcards}
                onChange={(e) => setFlashcards(e.target.value)}
              >
                <option>5</option>
                <option>10</option>
                <option>20</option>
                <option>50</option>
              </select> 
              flashcards to maintain my momentum and achieve my goals.
            </div>

            {/* Divider */}
            <div className={styles.divider}></div>

            {/* Signature Area */}
            <div className={styles.signatureArea}>
              <div className={styles.signatureBox}>
                <div className={styles.signatureText}>
                  {name || 'Your Signature'}
                </div>
                <span className={styles.signatureLabel}>Digital Signature</span>
              </div>
            </div>

            {/* Action Button */}
            <div className={styles.actionSection}>
              <button 
                type="submit" 
                className={`${styles.submitBtn} ${isSubmitting ? styles.submitting : ''}`}
                disabled={isSubmitting || !name.trim()}
              >
                {isSubmitting ? "✨ Committed! Let's go! ✨" : "🤝 I Commit to My Journey"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Commitment;
