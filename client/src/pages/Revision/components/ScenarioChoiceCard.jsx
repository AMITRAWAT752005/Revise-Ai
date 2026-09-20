import React, { useState } from 'react';
import styles from './ScenarioChoiceCard.module.css';

export default function ScenarioChoiceCard({ 
  data,
  onCorrect, 
  onNext,
  scenario,
  correctOption,
  rationale,
  subject,
  topic
}) {
  const activeScenario = data?.scenario || scenario || "Reliable and ordered data delivery with congestion control";
  const activeCorrectOption = data?.correctOption || correctOption || "A";
  const activeRationale = data?.rationale || data?.explanation || rationale || "TCP is a connection-oriented protocol that guarantees delivery and packet ordering, making it the right choice for scenarios where missing data is intolerable.";
  const activeSubject = data?.subject || subject || "Computer Networks";
  const activeTopic = data?.topic || topic || "Protocol Selection Dilemma";

  const [selectedChoice, setSelectedChoice] = useState(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelect = (choice) => {
    if (isSubmitted) return;
    setSelectedChoice(choice);
    setIsSubmitted(true);
    if (choice === activeCorrectOption && onCorrect) {
      onCorrect();
    }
  };

  const isCorrect = selectedChoice === activeCorrectOption;

  return (
    <div className={styles.container}>
      {/* Top Meta Bar */}
      <div className={styles.headerBar}>
        <div className={styles.badgeGroup}>
          <span className={styles.modeBadge}>
            <span className={`material-symbols-outlined ${styles.modeIcon}`} style={{ fontSize: '16px' }}>
              psychology
            </span>
            What Would You Choose?
          </span>
          <span className={styles.topicText}>{activeSubject} • {activeTopic}</span>
        </div>
        <div className={styles.sparkleBadge}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>auto_awesome</span>
          <span>+15 XP</span>
        </div>
      </div>

      {/* Scenario Header */}
      <div className={styles.titleSection}>
        <span className={styles.subPill}>Practical Architecture Dilemma</span>
        <h2 className={styles.scenarioHeadline}>{activeScenario}</h2>
      </div>

      {/* Choice Grid */}
      <div className={styles.choiceGrid}>
        {/* Choice A: TCP */}
        <button
          type="button"
          onClick={() => handleSelect("A")}
          disabled={isSubmitted}
          className={`
            ${styles.choiceCard} 
            ${styles.cardA}
            ${selectedChoice === "A" ? (isCorrect ? styles.selectedCardCorrect : styles.selectedCardWrong) : ''}
            ${isSubmitted && activeCorrectOption === "A" ? styles.highlightWinner : ''}
          `}
        >
          <div className={styles.iconCircleA}>
            <span className={`material-symbols-outlined ${styles.iconA}`} style={{ fontSize: '48px', fontVariationSettings: "'FILL' 1" }}>
              assured_workload
            </span>
          </div>
          <div className={styles.choiceDetails}>
            <h3 className={styles.choiceTitle}>TCP</h3>
            <p className={styles.choiceDesc}>Transmission Control Protocol</p>
          </div>
          <div className={styles.selectPillA}>
            <span>Select A</span>
          </div>
        </button>

        {/* Choice B: UDP */}
        <button
          type="button"
          onClick={() => handleSelect("B")}
          disabled={isSubmitted}
          className={`
            ${styles.choiceCard} 
            ${styles.cardB}
            ${selectedChoice === "B" ? (isCorrect ? styles.selectedCardCorrect : styles.selectedCardWrong) : ''}
            ${isSubmitted && activeCorrectOption === "B" ? styles.highlightWinner : ''}
          `}
        >
          <div className={styles.iconCircleB}>
            <span className={`material-symbols-outlined ${styles.iconB}`} style={{ fontSize: '48px', fontVariationSettings: "'FILL' 1" }}>
              speed
            </span>
          </div>
          <div className={styles.choiceDetails}>
            <h3 className={styles.choiceTitle}>UDP</h3>
            <p className={styles.choiceDesc}>User Datagram Protocol</p>
          </div>
          <div className={styles.selectPillB}>
            <span>Select B</span>
          </div>
        </button>
      </div>

      {/* Rationale & Feedback */}
      {isSubmitted && (
        <div className={styles.feedbackSection}>
          <div className={isCorrect ? styles.correctBanner : styles.wrongBanner}>
            <div className={styles.bannerHeader}>
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                {isCorrect ? 'check_circle' : 'info'}
              </span>
              <h4>{isCorrect ? "EXCELLENT DECISION! +15 XP" : "SUB-OPTIMAL CHOICE"}</h4>
            </div>
            <p className={styles.rationaleText}>{activeRationale}</p>
          </div>

          <div className={styles.actionRow}>
            <button 
              type="button" 
              className={styles.nextBtn}
              onClick={onNext}
            >
              <span>Next Challenge</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
