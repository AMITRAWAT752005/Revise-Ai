import React from 'react';
import styles from './ComboRewardModal.module.css';

const defaultComboData = {
  comboCount: 5,
  title: '5 IN A ROW!',
  xpBonus: 25,
  subtext:
    "You're on fire! Keep this pace up to master the next topic in half the time."
};

const ComboRewardModal = ({ data = defaultComboData, onContinue, onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.comboCard}>
        {/* Top Accent */}
        <div className={styles.topAccent}></div>

        {/* Combo Fire Badge */}
        <div className={styles.fireBadge}>
          <span className={styles.fireEmoji}>🔥</span>
          <span className={styles.fireText}>
            COMBO ×{data.comboCount || 5}
          </span>
        </div>

        {/* Reward Headlines */}
        <div className={styles.headlines}>
          <h2 className={styles.streakTitle}>{data.title || '5 IN A ROW!'}</h2>

          <div className={styles.bonusWrapper}>
            <span className={styles.bonusText}>
              +{data.xpBonus || 25} XP BONUS
            </span>
            <span
              className={`material-symbols-outlined ${styles.sparkleTop}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
            <span
              className={`material-symbols-outlined ${styles.sparkleBottom}`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              star
            </span>
          </div>
        </div>

        {/* Subtext */}
        <p className={styles.subtext}>{data.subtext}</p>

        {/* Continue Button */}
        <button
          type="button"
          className={styles.continueBtn}
          onClick={onContinue}
        >
          <span>Continue Journey</span>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
};

export default ComboRewardModal;
