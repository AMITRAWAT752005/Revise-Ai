import React, { useState } from 'react';
import styles from './FillTheGapCard.module.css';

const defaultData = {
  topic: 'Database Fundamentals',
  progress: 65,
  prefix: 'Normalization helps reduce',
  suffix: 'in a database.',
  correctAnswer: 'redundancy',
  explanation: 'Normalization minimizes redundant data and ensures data integrity.',
  options: ['latency', 'redundancy', 'security', 'complexity']
};

import { normalizeFillGapData } from '../mockRevisionData';

const FillTheGapCard = ({ data, onContinue, onBack }) => {
  const normalizedData = normalizeFillGapData(data);
  const [selectedWord, setSelectedWord] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [evaluated, setEvaluated] = useState(false);

  const handleSelect = (word) => {
    if (evaluated) return;
    setSelectedWord(word);
    setEvaluated(true);
  };

  const isCorrect = selectedWord === normalizedData.correctAnswer;

  const handleReset = () => {
    setSelectedWord(null);
    setEvaluated(false);
  };

  return (
    <div className={styles.container}>
      {/* Progress Section */}
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
          <span className={styles.topicBadge}>{normalizedData.topic}</span>
        </div>

        <div className={styles.progressContainer}>
          <div className={styles.track}>
            <div
              className={styles.bar}
              style={{ width: `${normalizedData.progress}%` }}
            ></div>
          </div>
          <span className={styles.percentText}>{normalizedData.progress}%</span>
        </div>
      </div>

      {/* Interactive Card */}
      <div className={styles.card}>
        {/* Top Accent line */}
        <div className={styles.topAccent}></div>

        {/* AI Hint Indicator */}
        <button
          type="button"
          className={styles.aiHintBtn}
          onClick={() => setShowHint(!showHint)}
        >
          <span className={`material-symbols-outlined ${styles.sparkleIcon}`}>
            auto_awesome
          </span>
          <span className={styles.hintLabel}>
            {showHint ? 'Hint: Think about duplication' : 'AI Hint Available'}
          </span>
        </button>

        {/* Sentence with Gap */}
        <div className={styles.sentenceWrapper}>
          <h2 className={styles.sentenceText}>
            {normalizedData.prefix}{' '}
            <span
              className={`${styles.gapTarget} ${
                selectedWord
                  ? isCorrect
                    ? styles.gapCorrect
                    : styles.gapIncorrect
                  : ''
              }`}
            >
              {selectedWord || '__________'}
            </span>{' '}
            {normalizedData.suffix}
          </h2>
        </div>

        {/* Answer Options Grid */}
        <div className={styles.optionsGrid}>
          {normalizedData.options.map((opt) => {
            const isSelected = selectedWord === opt;
            const isTargetCorrect = opt === normalizedData.correctAnswer;

            let chipStyle = styles.chipBtn;
            if (evaluated) {
              if (isSelected && isCorrect) {
                chipStyle = `${styles.chipBtn} ${styles.chipCorrect}`;
              } else if (isSelected && !isCorrect) {
                chipStyle = `${styles.chipBtn} ${styles.chipIncorrect}`;
              } else if (isTargetCorrect) {
                chipStyle = `${styles.chipBtn} ${styles.chipTargetHighlight}`;
              }
            }

            return (
              <button
                key={opt}
                type="button"
                className={chipStyle}
                disabled={evaluated}
                onClick={() => handleSelect(opt)}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {/* Feedback Area */}
        {evaluated && (
          <div
            className={`${styles.feedbackArea} ${
              isCorrect ? styles.feedbackSuccess : styles.feedbackError
            }`}
          >
            <span
              className={`material-symbols-outlined ${styles.feedbackIcon}`}
            >
              {isCorrect ? 'check_circle' : 'error'}
            </span>
            <div className={styles.feedbackContent}>
              <p className={styles.feedbackTitle}>
                {isCorrect
                  ? 'Excellent!'
                  : 'Not quite! The primary goal is reducing duplicate data.'}
              </p>
              <p className={styles.feedbackExplanation}>{normalizedData.explanation}</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        {evaluated && (
          <div className={styles.actionFooter}>
            {!isCorrect && (
              <button
                type="button"
                className={styles.retryBtn}
                onClick={handleReset}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  replay
                </span>
                <span>Try Again</span>
              </button>
            )}
            <button
              type="button"
              className={styles.continueBtn}
              onClick={() => onContinue && onContinue(isCorrect)}
            >
              <span>Continue</span>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                arrow_forward
              </span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FillTheGapCard;
