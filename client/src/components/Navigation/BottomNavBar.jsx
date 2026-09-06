import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './BottomNavBar.module.css';

const BottomNavBar = () => {
  return (
    <nav className={styles.bottomNav} aria-label="Mobile Navigation">
      <NavLink
        to="/home"
        className={({ isActive }) =>
          isActive ? `${styles.navItem} ${styles.activeItem}` : styles.navItem
        }
      >
        <span className={`material-symbols-outlined ${styles.navIcon}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          home
        </span>
        <span className={styles.navLabel}>Home</span>
      </NavLink>

      <NavLink
        to="/subjects"
        className={({ isActive }) =>
          isActive ? `${styles.navItem} ${styles.activeItem}` : styles.navItem
        }
      >
        <span className={`material-symbols-outlined ${styles.navIcon}`}>
          book
        </span>
        <span className={styles.navLabel}>Subjects</span>
      </NavLink>

      <NavLink
        to="/revision"
        className={({ isActive }) =>
          isActive ? `${styles.navItem} ${styles.activeItem}` : styles.navItem
        }
      >
        <span className={`material-symbols-outlined ${styles.navIcon}`}>
          refresh
        </span>
        <span className={styles.navLabel}>Revision</span>
      </NavLink>

      <NavLink
        to="/analytics"
        className={({ isActive }) =>
          isActive ? `${styles.navItem} ${styles.activeItem}` : styles.navItem
        }
      >
        <span className={`material-symbols-outlined ${styles.navIcon}`}>
          analytics
        </span>
        <span className={styles.navLabel}>Analytics</span>
      </NavLink>
    </nav>
  );
};

export default BottomNavBar;
