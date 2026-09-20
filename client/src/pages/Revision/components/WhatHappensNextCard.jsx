import React, { useState } from 'react';
import styles from './WhatHappensNextCard.module.css';

const DEFAULT_OPTIONS = [
  { id: 'A', text: 'The database backup is paused indefinitely until sys_monitor completes.', isCorrect: false },
  { id: 'B', text: 'sys_monitor priority is dynamically lowered; backup receives allocated time slices.', isCorrect: true },
  { id: 'C', text: 'The OS immediately terminates the backup process to prevent an unrecoverable kernel panic.', isCorrect: false },
  { id: 'D', text: 'Both processes run at locked static priority, causing immediate system deadlock.', isCorrect: false }
];

import { normalizeWhatHappensNextData } from '../mockRevisionData';

export default function WhatHappensNextCard({ 
  data,
  onCorrect, 
  onNext,
  title,
  scenario,
  subject,
  topic
}) {
  const normalized = normalizeWhatHappensNextData(data || {});
  const activeTitle = title || normalized.title || "Process Scheduling & Starvation Prevention";
  const activeScenario = scenario || normalized.scenario || "A critical monitoring daemon (sys_monitor) begins consuming 95% of CPU cycles. Simultaneously, a user-initiated database snapshot starts, requesting high I/O priority. The scheduler operates on multi-level feedback queues with dynamic priority aging.";
  const activeSubject = subject || normalized.subject || "Operating Systems";
  const activeTopic = topic || normalized.topic || "CPU Scheduling & Concurrency";
  const options = normalized.options || DEFAULT_OPTIONS;
  const explanation = normalized.explanation || "Dynamic priority aging lowers CPU-bound processes to prevent starvation and ensure I/O tasks receive timely time slices.";

  const [selectedId, setSelectedId] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleSelect = (option) => {
    if (isAnswered) return;
    setSelectedId(option.id);
    setIsAnswered(true);
    if (option.isCorrect && onCorrect) {
      onCorrect();
    }
  };

  const selectedOption = options.find(o => o.id === selectedId);
  const isCorrect = selectedOption?.isCorrect;

  return (
    <div className={styles.container}>
      {/* Header Meta */}
      <div className={styles.headerBar}>
        <div className={styles.badgeGroup}>
          <span className={styles.modeBadge}>
            <span className={`material-symbols-outlined ${styles.modeIcon}`} style={{ fontSize: '16px' }}>
              psychology
            </span>
            What Happens Next?
          </span>
          <span className={styles.topicText}>{activeSubject} • {activeTopic}</span>
        </div>
        <div className={styles.sparkleBadge}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>auto_awesome</span>
          <span>+15 XP</span>
        </div>
      </div>

      {/* Scenario Card */}
      <div className={styles.scenarioCard}>
        <div className={styles.topAccent} />
        <div className={styles.scenarioHeader}>
          <div className={styles.scenarioTitleGroup}>
            <span className={`material-symbols-outlined ${styles.cpuIcon}`} style={{ fontSize: '24px' }}>
              memory
            </span>
            <h2 className={styles.scenarioTitle}>{activeTitle}</h2>
          </div>
          <span className={`material-symbols-outlined ${styles.sparkleIcon}`} style={{ fontSize: '22px' }}>
            auto_awesome
          </span>
        </div>
        <p className={styles.scenarioBody}>{activeScenario}</p>

        <div className={styles.questionPrompt}>
          <span className={`material-symbols-outlined ${styles.questionIcon}`} style={{ fontSize: '20px' }}>
            help_outline
          </span>
          <h3 className={styles.questionText}>What Happens Next?</h3>
        </div>
      </div>

      {/* Bento Grid Options */}
      <div className={styles.optionsGrid}>
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          const isItemCorrect = isAnswered && option.isCorrect;
          const isItemWrong = isSelected && !option.isCorrect;

          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleSelect(option)}
              disabled={isAnswered}
              className={`
                ${styles.optionCard} 
                ${isSelected ? styles.selectedOption : ''}
                ${isItemCorrect ? styles.correctOption : ''}
                ${isItemWrong ? styles.wrongOption : ''}
              `}
            >
              <div className={styles.optionLetter}>{option.id}</div>
              <div className={styles.optionText}>{option.text}</div>
            </button>
          );
        })}
      </div>

      {/* Feedback Banner */}
      {isAnswered && (
        <div className={isCorrect ? styles.correctBanner : styles.wrongBanner}>
          <div className={styles.bannerLeft}>
            <div className={styles.bannerIconWrapper}>
              <span className="material-symbols-outlined" style={{ fontSize: '26px' }}>
                {isCorrect ? 'check_circle' : 'cancel'}
              </span>
            </div>
            <div>
              <div className={styles.bannerHeadline}>
                {isCorrect ? "GOOD PREDICTION! +15 XP" : "INCORRECT PREDICTION"}
              </div>
              <div className={styles.bannerSubtext}>
                {isCorrect 
                  ? explanation
                  : "Modern operating systems use dynamic aging to downgrade compute-heavy tasks and ensure all processes make progress."}
              </div>
            </div>
          </div>
          <button 
            type="button" 
            className={styles.nextBtn}
            onClick={onNext}
          >
            <span>Next Scenario</span>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
          </button>
        </div>
      )}
    </div>
  );
}
