import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNavBar from '../../components/Navigation/SideNavBar';
import BottomNavBar from '../../components/Navigation/BottomNavBar';
import styles from './Revision.module.css';

const Revision = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
  }, []);

  const handleStartNow = () => {
    // In Phase 2, this is the Commitment Prompt screen.
    // When Phase 4 (Questions/Interactive Revision) is built, this will launch the interactive session.
    alert('Session locked in! Ready for Phase 4 interactive revision.');
  };

  const handleMaybeLater = () => {
    navigate('/home');
  };

  return (
    <div className={styles.revisionContainer}>
      {/* Desktop Sidebar Navigation */}
      <SideNavBar
        user={user}
        xpEarned={820}
        onQuickRevision={() => {}}
      />

      {/* Main Workspace with Blurred Background Placeholders */}
      <main className={styles.mainWorkspace}>
        {/* Top App Bar */}
        <header className={styles.topBar}>
          <div className={styles.brandGroup}>
            <button
              className={styles.mobileMenuBtn}
              onClick={() => navigate('/home')}
              aria-label="Back to Home"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <span className={styles.mobileLogoTitle}>ReviseAI</span>
          </div>
          <div className={styles.topActions}>
            <button className={styles.iconBtn} onClick={() => navigate('/home')} title="Notifications">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className={styles.iconBtn} onClick={() => navigate('/settings')} title="Account">
              <span className="material-symbols-outlined">account_circle</span>
            </button>
            <button className={styles.iconBtn} onClick={() => navigate('/settings')} title="Settings">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        {/* Blurred Dashboard Background Skeleton (as in Stitch design) */}
        <div className={styles.blurredBackground} aria-hidden="true">
          <div className={styles.placeholderHero}>
            <div className={styles.skeletonLineLong}></div>
            <div className={styles.skeletonLineMedium}></div>
          </div>
          <div className={styles.placeholderGrid}>
            <div className={styles.placeholderCard}></div>
            <div className={styles.placeholderCard}></div>
            <div className={styles.placeholderCard}></div>
          </div>
        </div>

        {/* ==================================================== */}
        {/* COMMITMENT PROMPT MODAL (EXACT STITCH DESIGN)        */}
        {/* ==================================================== */}
        <div className={styles.modalOverlay}>
          <div className={styles.modalCard} role="dialog" aria-modal="true" aria-labelledby="commitment-title">
            {/* Mobile Drag Handle */}
            <div className={styles.dragHandle}></div>

            {/* Sparkle Icon Container */}
            <div className={styles.iconContainer}>
              <span className={`material-symbols-outlined ${styles.sparkleIcon}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                auto_awesome
              </span>
            </div>

            {/* Modal Heading */}
            <h2 id="commitment-title" className={styles.modalTitle}>
              Ready to lock in?
            </h2>

            {/* Modal Description */}
            <p className={styles.modalDescription}>
              10 minutes is all it takes to make it stick. Try to complete the full series or stay focused for at least 10 minutes.
            </p>

            {/* Action Buttons */}
            <div className={styles.actionGroup}>
              <button className={styles.startNowBtn} onClick={handleStartNow}>
                <span>Start Now</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  arrow_forward
                </span>
              </button>
              <button className={styles.maybeLaterBtn} onClick={handleMaybeLater}>
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavBar />
    </div>
  );
};

export default Revision;
