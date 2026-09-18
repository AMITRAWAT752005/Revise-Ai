import React from 'react';
import styles from './WrongFeedbackModal.module.css';

const defaultWrongData = {
  subject: 'Network Protocols',
  progressStep: 3,
  totalSteps: 4,
  question:
    'Which transport layer protocol is connectionless and does not guarantee delivery?',
  userSelection: 'TCP (Transmission Control Protocol)',
  otherOptions: [
    'UDP (User Datagram Protocol)',
    'ICMP (Internet Control Message Protocol)'
  ],
  correctAnswer: 'UDP (User Datagram Protocol)',
  title: 'Not quite! 👀',
  explanation:
    'TCP is connection-oriented and guarantees delivery. UDP is the connectionless one!'
};

const WrongFeedbackModal = ({
  data = defaultWrongData,
  onGotIt,
  onTryAgain,
  onBack
}) => {
  return (
    <div className={styles.container}>
      {/* Context & Progress */}
      <div className={styles.topContext}>
        <div className={styles.subjectGroup}>
          {onBack && (
            <button
              type="button"
              className={styles.backBtn}
              onClick={onBack}
              aria-label="Back"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          )}
          <span className={styles.subjectTitle}>{data.subject}</span>
        </div>

        {/* Progress pills */}
        <div className={styles.progressPills}>
          {Array.from({ length: data.totalSteps || 4 }).map((_, idx) => {
            const isCurrent = idx + 1 === (data.progressStep || 3);
            return (
              <div
                key={idx}
                className={`${styles.pill} ${
                  isCurrent ? styles.activePill : ''
                }`}
              ></div>
            );
          })}
        </div>
      </div>

      {/* Shaking Question Card */}
      <div className={styles.questionCard}>
        <div className={styles.cardAccent}></div>

        <h2 className={styles.questionTitle}>{data.question}</h2>

        <div className={styles.optionsList}>
          {/* Wrong Selected Option */}
          <div className={styles.wrongOption}>
            <span className={styles.optionText}>{data.userSelection}</span>
            <span
              className={`material-symbols-outlined ${styles.wrongIcon}`}
            >
              close
            </span>
          </div>

          {/* Other Options */}
          {data.otherOptions &&
            data.otherOptions.map((opt, idx) => (
              <div key={idx} className={styles.otherOption}>
                <span className={styles.optionText}>{opt}</span>
              </div>
            ))}
        </div>
      </div>

      {/* Friendly Feedback Area */}
      <div className={styles.feedbackArea}>
        <div className={styles.errorIconCircle}>
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1", fontSize: '32px' }}
          >
            error
          </span>
        </div>

        <h3 className={styles.feedbackTitle}>{data.title}</h3>
        <p className={styles.feedbackExplanation}>{data.explanation}</p>

        <div className={styles.actionsRow}>
          {onTryAgain && (
            <button
              type="button"
              className={styles.tryAgainBtn}
              onClick={onTryAgain}
            >
              <span className="material-symbols-outlined">replay</span>
              <span>Try Again</span>
            </button>
          )}
          <button
            type="button"
            className={styles.gotItBtn}
            onClick={onGotIt}
          >
            <span>Got it</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default WrongFeedbackModal;
