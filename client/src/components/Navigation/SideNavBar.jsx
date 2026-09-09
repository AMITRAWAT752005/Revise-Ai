import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './SideNavBar.module.css';
import bookLogo from '../../assets/images/book-logo-small.png';

const SideNavBar = ({ user, xpEarned = 0, onQuickRevision }) => {
  const navigate = useNavigate();

  const handleStartQuickRevision = () => {
    if (onQuickRevision) {
      onQuickRevision();
    } else {
      navigate('/revision');
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } finally {
      localStorage.removeItem('user');
      localStorage.removeItem('commitmentPending');
      navigate('/login', { replace: true });
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
            <button type="button" onClick={handleLogout} className={`${styles.navLink} ${styles.navLinkButton} ${styles.logoutButton}`}>
              <span className={`material-symbols-outlined ${styles.navIcon}`}>logout</span>
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default SideNavBar;
