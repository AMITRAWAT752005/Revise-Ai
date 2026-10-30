import React, { useState } from 'react';
import styles from './TrueFalseCard.module.css';

export default function TrueFalseCard({ 
  data,
  onCorrect, 
  onNext,
  statement,
  correctAnswer,
  rationale,
  subject,
  topic
}) {
  const activeStatement = data?.statement || statement || "HTTP/3 uses UDP as its underlying transport layer protocol instead of TCP (using the QUIC protocol).";
  const activeCorrectAnswer = typeof data?.answer === 'boolean' 
    ? data.answer 
    : typeof data?.correctAnswer === 'boolean' 
      ? data.correctAnswer 
      : typeof correctAnswer === 'boolean' 
        ? correctAnswer 
        : true;
  const activeRationale = data?.explanation || data?.rationale || rationale || "HTTP/3 replaces TCP with QUIC, an application-level transport protocol built over UDP to eliminate head-of-line blocking and speed up handshakes.";
  const activeSubject = data?.subject || subject || "Computer Networks";
  const activeTopic = data?.topic || topic || "Application & Transport Protocols";

  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleSelect = (answer) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setIsAnswered(true);
    const correct = answer === activeCorrectAnswer;
    setIsCorrect(correct);
    if (correct && onCorrect) {
      onCorrect();
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Meta Bar */}
      <div className={styles.headerBar}>
        <div className={styles.badgeGroup}>
          <span className={styles.modeBadge}>
            <span className={`material-symbols-outlined ${styles.modeIcon}`} style={{ fontSize: '16px' }}>
              balance
            </span>
            True / False
          </span>
          <span className={styles.topicText}>{activeSubject} • {activeTopic}</span>
        </div>
        <div className={styles.sparkleBadge}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>auto_awesome</span>
          <span>+10 XP</span>
        </div>
      </div>

      <div className={styles.titleSection}>
        <h2 className={styles.title}>Is This Statement True or False?</h2>
        <p className={styles.subtitle}>Evaluate the technical accuracy of the claim below.</p>
      </div>

      {/* Statement Card */}
      <div className={`
        ${styles.statementCard} 
        ${isAnswered && isCorrect ? styles.correctCardBorder : ''}
        ${isAnswered && !isCorrect ? styles.wrongCardBorder : ''}
      `}>
        <div className={styles.sparkleAccent} />
        <p className={styles.statementText}>"{activeStatement}"</p>
      </div>

      {/* Action Buttons: False vs True */}
      <div className={styles.choiceGrid}>
        <button
          type="button"
          onClick={() => handleSelect(false)}
          disabled={isAnswered}
          className={`
            ${styles.choiceBtn} 
            ${styles.falseBtn}
            ${selectedAnswer === false ? (isCorrect ? styles.selectedCorrect : styles.selectedWrong) : ''}
            ${isAnswered && activeCorrectAnswer === false ? styles.highlightCorrect : ''}
          `}
        >
          <div className={styles.iconCircleFalse}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>close</span>
          </div>
          <span className={styles.choiceLabel}>FALSE</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelect(true)}
          disabled={isAnswered}
          className={`
            ${styles.choiceBtn} 
            ${styles.trueBtn}
            ${selectedAnswer === true ? (isCorrect ? styles.selectedCorrect : styles.selectedWrong) : ''}
            ${isAnswered && activeCorrectAnswer === true ? styles.highlightCorrect : ''}
          `}
        >
          <div className={styles.iconCircleTrue}>
            <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>check</span>
          </div>
          <span className={styles.choiceLabel}>TRUE</span>
        </button>
      </div>

      {/* Feedback & Rationale */}
      {isAnswered && (
        <div className={styles.feedbackSection}>
          <div className={isCorrect ? styles.correctBanner : styles.wrongBanner}>
            <div className={styles.bannerIcon}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                {isCorrect ? 'check_circle' : 'cancel'}
              </span>
            </div>
            <div className={styles.bannerContent}>
              <div className={styles.bannerHeadline}>
                {isCorrect ? "CORRECT! +10 XP" : "INCORRECT"}
              </div>
              <div className={styles.bannerSubtext}>
                {activeRationale}
              </div>
            </div>
          </div>

          <div className={styles.actionRow}>
            <button 
              type="button" 
              className={styles.nextBtn}
              onClick={onNext}
            >
              <span>Next Question</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
