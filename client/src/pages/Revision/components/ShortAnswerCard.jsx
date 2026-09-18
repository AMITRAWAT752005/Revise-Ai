import React, { useState } from 'react';
import styles from './ShortAnswerCard.module.css';

const defaultShortAnswer = {
  subject: 'Networking Fundamentals',
  questionIndex: 4,
  totalQuestions: 10,
  question: 'What is the difference between TCP and UDP?',
  description: 'Provide a brief explanation focusing on connection type and reliability.',
  maxLength: 300,
  initialAnswer: ''
};

const ShortAnswerCard = ({ data = defaultShortAnswer, onSubmit, onBack }) => {
  const [answer, setAnswer] = useState(data.initialAnswer || '');
  const maxLength = data.maxLength || 300;

  const handleChange = (e) => {
    if (e.target.value.length <= maxLength) {
      setAnswer(e.target.value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (answer.trim() && onSubmit) {
      onSubmit(answer);
    }
  };

  const isNearLimit = answer.length >= maxLength - 20;

  return (
    <div className={styles.container}>
      {/* Header Context */}
      <div className={styles.header}>
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
          <span className="material-symbols-outlined" style={{ fontSize: '18px', color: '#464554' }}>
            dns
          </span>
          <span className={styles.subjectText}>{data.subject}</span>
        </div>

        <span className={styles.questionCount}>
          Question {data.questionIndex || 4} of {data.totalQuestions || 10}
        </span>
      </div>

      {/* Main Question Card */}
      <form className={styles.card} onSubmit={handleSubmit}>
        {/* Decorative Top Accent */}
        <div className={styles.topAccent}></div>

        {/* AI Sparkle */}
        <div className={styles.sparkleIcon}>
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            temp_preferences_custom
          </span>
        </div>

        {/* Title & Description */}
        <div className={styles.cardHeader}>
          <h2 className={styles.questionTitle}>{data.question}</h2>
          <p className={styles.questionSubtitle}>{data.description}</p>
        </div>

        {/* Text Area with Character Counter */}
        <div className={styles.inputWrapper}>
          <textarea
            className={styles.textarea}
            value={answer}
            onChange={handleChange}
            placeholder="Type your answer here..."
            rows={5}
          />
          <div className={styles.counterFooter}>
            <span
              className={`${styles.charCount} ${
                isNearLimit ? styles.charCountWarning : ''
              }`}
            >
              {answer.length} / {maxLength}
            </span>
          </div>
        </div>

        {/* Submit Action */}
        <div className={styles.actionRow}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={!answer.trim()}
          >
            <span>Submit Answer</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              send
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ShortAnswerCard;
