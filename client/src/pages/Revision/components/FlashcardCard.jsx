import React, { useState } from 'react';
import styles from './FlashcardCard.module.css';

const defaultFlashcard = {
  subject: 'Operating Systems Review',
  category: 'Operating Systems Core Concept',
  index: 12,
  total: 50,
  question: 'What is a Deadlock?',
  answerTitle: 'Deadlock',
  answerDefinition:
    'A situation in computer systems where a set of processes are blocked because each process is holding a resource and waiting for another resource acquired by some other process.',
  conditionsTitle: 'Key Conditions (Coffman):',
  conditions: [
    'Mutual Exclusion',
    'Hold and Wait',
    'No Preemption',
    'Circular Wait'
  ]
};

import { normalizeFlashcardData } from '../mockRevisionData';

const FlashcardCard = ({
  data,
  initialFlipped = false,
  onRate,
  onBack
}) => {
  const normalizedData = normalizeFlashcardData(data);
  const [isFlipped, setIsFlipped] = useState(initialFlipped);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleRate = (rating, e) => {
    e.stopPropagation();
    if (onRate) {
      onRate(rating);
    }
  };

  const progressPercent = Math.round(((normalizedData.index || 12) / (normalizedData.total || 50)) * 100);

  return (
    <div className={styles.container}>
      {/* Progress Indicator */}
      <div className={styles.progressHeader}>
        <div className={styles.headerLeft}>
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
          <span className={styles.subjectText}>{normalizedData.subject}</span>
        </div>
        <span className={styles.countText}>
          {normalizedData.index || 12} / {normalizedData.total || 50}
        </span>
      </div>

      <div className={styles.progressTrack}>
        <div
          className={styles.progressBar}
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>

      {/* 3D Flashcard Container */}
      <div
        className={styles.flipCard}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label="Flip flashcard"
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleFlip();
          }
        }}
      >
        {/* Floating Sparkles for Front */}
        {!isFlipped && (
          <div className={styles.sparkleTopRight}>
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: '32px' }}
            >
              auto_awesome
            </span>
          </div>
        )}

        <div
          className={`${styles.flipCardInner} ${
            isFlipped ? styles.isFlipped : ''
          }`}
        >
          {/* ================= FRONT OF CARD ================= */}
          <div className={styles.cardFront}>
            <div className={styles.frontAccent}></div>

            <div className={styles.iconCircle}>
              <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                psychology
              </span>
            </div>

            <h2 className={styles.frontTitle}>{normalizedData.question}</h2>
            <p className={styles.frontCategory}>{normalizedData.category}</p>

            <div className={styles.tapPrompt}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                touch_app
              </span>
              <span>Tap / Click to Flip</span>
            </div>
          </div>

          {/* ================= BACK OF CARD ================= */}
          <div className={styles.cardBack}>
            <div className={styles.backAccent}></div>

            <div className={styles.sparkleBack}>
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1", fontSize: '24px' }}
              >
                magic_button
              </span>
            </div>

            <div className={styles.backContent}>
              <h2 className={styles.backTitle}>{normalizedData.answerTitle}</h2>
              <p className={styles.backDefinition}>{normalizedData.answerDefinition}</p>

              {normalizedData.conditions && normalizedData.conditions.length > 0 && (
                <div className={styles.conditionsBox}>
                  <span className={styles.conditionsHeading}>
                    {normalizedData.conditionsTitle || 'Key Conditions:'}
                  </span>
                  <ul className={styles.conditionsList}>
                    {normalizedData.conditions.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className={styles.tapPrompt}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                touch_app
              </span>
              <span>Tap / Click to Flip Back</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (Visible on Back or always accessible) */}
      <div className={styles.ratingBar}>
        <button
          type="button"
          className={`${styles.rateBtn} ${styles.againBtn}`}
          onClick={(e) => handleRate('again', e)}
        >
          <span className="material-symbols-outlined">refresh</span>
          <span>Again</span>
        </button>

        <button
          type="button"
          className={`${styles.rateBtn} ${styles.goodBtn}`}
          onClick={(e) => handleRate('good', e)}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            check_circle
          </span>
          <span>Good</span>
        </button>

        <button
          type="button"
          className={`${styles.rateBtn} ${styles.easyBtn}`}
          onClick={(e) => handleRate('easy', e)}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            bolt
          </span>
          <span>Easy</span>
        </button>
      </div>

      {/* Progress Dots */}
      <div className={styles.progressDots}>
        <div className={`${styles.dot} ${styles.activeDot}`}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
        <div className={styles.dot}></div>
      </div>
    </div>
  );
};

export default FlashcardCard;
