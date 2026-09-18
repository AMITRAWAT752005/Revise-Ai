import React from 'react';
import styles from './CorrectFeedbackModal.module.css';

const defaultCorrectData = {
  subject: 'Cell Biology 101',
  progressIndex: 14,
  progressTotal: 20,
  xpEarned: 10,
  question: 'What organelle is known as the powerhouse of the cell?',
  answer: 'Mitochondria',
  explanation:
    "Mitochondria generate most of the chemical energy needed to power the cell's biochemical reactions."
};

const CorrectFeedbackModal = ({
  data = defaultCorrectData,
  onNext,
  onAgain,
  onClose
}) => {
  const progressPercent = Math.round(
    ((data.progressIndex || 14) / (data.progressTotal || 20)) * 100
  );

  return (
    <div className={styles.overlay}>
      {/* Floating XP & Celebration Popup */}
      <div className={styles.xpPopupWrapper}>
        <div className={styles.xpGlowContainer}>
          <span
            className={`material-symbols-outlined ${styles.sparkle1}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          <span
            className={`material-symbols-outlined ${styles.sparkle2}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            star
          </span>
          <span
            className={`material-symbols-outlined ${styles.sparkle3}`}
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            grade
          </span>

          <div className={styles.xpBadge}>
            <div className={styles.xpInnerGlow}></div>
            <h2 className={styles.greatJobText}>GREAT JOB!</h2>
            <p className={styles.xpBonusText}>+{data.xpEarned || 10} XP</p>
          </div>
        </div>
      </div>

      {/* Main Flashcard/Feedback Container */}
      <div className={styles.cardContainer}>
        {/* Progress header */}
        <div className={styles.progressHeader}>
          <div className={styles.progressLabels}>
            <span className={styles.subjectName}>{data.subject}</span>
            <span className={styles.progressCount}>
              {data.progressIndex || 14} / {data.progressTotal || 20}
            </span>
          </div>
          <div className={styles.progressTrack}>
            <div
              className={styles.progressBar}
              style={{ width: `${progressPercent}%` }}
            >
              <div className={styles.progressShimmer}></div>
            </div>
          </div>
        </div>

        {/* Feedback Card */}
        <div className={styles.card}>
          <div className={styles.cardTopAccent}></div>

          <div className={styles.sparkleIcon}>
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              auto_awesome
            </span>
          </div>

          <div className={styles.questionSection}>
            <p className={styles.sectionLabel}>Question</p>
            <h3 className={styles.questionText}>{data.question}</h3>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.answerSection}>
            <p className={styles.answerLabel}>Answer</p>
            <h2 className={styles.answerText}>{data.answer}</h2>
            <p className={styles.explanationText}>{data.explanation}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionsRow}>
          <button
            type="button"
            className={styles.againBtn}
            onClick={onAgain}
          >
            <span className="material-symbols-outlined">replay</span>
            <span>Again</span>
          </button>

          <button
            type="button"
            className={styles.nextBtn}
            onClick={onNext}
          >
            <span>Next</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CorrectFeedbackModal;
