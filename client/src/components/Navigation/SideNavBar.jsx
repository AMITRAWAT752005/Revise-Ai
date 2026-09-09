import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './SideNavBar.module.css';
import bookLogo from '../../assets/images/book-logo.png';

const SideNavBar = ({ user, xpEarned = 0, onQuickRevision }) => {
  const navigate = useNavigate();

  const handleStartQuickRevision = () => {
    if (onQuickRevision) {
      onQuickRevision();
    } else {
      navigate('/revision');
    }
  };

  return (
    <nav className={styles.sideNav}>
      <div className={styles.topSection}>
        {/* Brand Header */}
        <div className={styles.brandHeader}>
          <img src={bookLogo} alt="ReviseAI Logo" className={styles.logoImage} />
          <div>
            <h1 className={styles.brandTitle}>ReviseAI</h1>
            <p className={styles.brandSubtitle}>AI-Powered Study</p>
          </div>
        </div>

        {/* Navigation Items */}
        <ul className={styles.navList}>
          <li>
            <NavLink
              to="/home"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink
              }
            >
              <span className={`material-symbols-outlined ${styles.navIcon}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                home
              </span>
              <span>Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/subjects"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink
              }
            >
              <span className={`material-symbols-outlined ${styles.navIcon}`}>book_2</span>
              <span>Subjects</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/revision"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink
              }
            >
              <span className={`material-symbols-outlined ${styles.navIcon}`}>edit_square</span>
              <span>Revision</span>
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink
              }
            >
              <span className={`material-symbols-outlined ${styles.navIcon}`}>insights</span>
              <span>Analytics</span>
            </NavLink>
          </li>
        </ul>
      </div>

      {/* Bottom Section */}
      <div className={styles.bottomSection}>
        <button
          className={styles.quickRevisionBtn}
          onClick={handleStartQuickRevision}
        >
          Start Quick Revision
        </button>

        <div className={styles.xpChip}>
          <span className={`material-symbols-outlined ${styles.starIcon}`} style={{ fontVariationSettings: "'FILL' 1" }}>
            star
          </span>
          <span className={styles.xpText}>{xpEarned} XP Earned</span>
        </div>

        <ul className={styles.secondaryList}>
          <li>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                isActive ? `${styles.navLink} ${styles.activeLink}` : styles.navLink
              }
            >
              <span className={`material-symbols-outlined ${styles.navIcon}`}>settings</span>
              <span>Settings</span>
            </NavLink>
          </li>
          <li>
            <a
              href="#support"
              onClick={(e) => {
                e.preventDefault();
                alert('ReviseAI Support: Contact support@reviseai.com for assistance.');
              }}
              className={styles.navLink}
            >
              <span className={`material-symbols-outlined ${styles.navIcon}`}>help</span>
              <span>Support</span>
            </a>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default SideNavBar;
