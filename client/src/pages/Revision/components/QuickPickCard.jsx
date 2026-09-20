import React, { useState } from 'react';
import styles from './QuickPickCard.module.css';

const defaultQuestion = {
  subject: 'Operating Systems',
  module: 'Module 4',
  progress: 33,
  question: 'What is the primary function of CPU scheduling?',
  description: 'Select the most accurate description from the options below.',
  options: [
    { id: 'opt-1', icon: 'memory', label: 'Manage Process Execution', isCorrect: true },
    { id: 'opt-2', icon: 'database', label: 'Allocate Disk Memory', isCorrect: false },
    { id: 'opt-3', icon: 'router', label: 'Route Network Traffic', isCorrect: false }
  ]
};

import { normalizeMCQData } from '../mockRevisionData';

const QuickPickCard = ({ data, onSelectOption, onBack }) => {
  const normalizedData = normalizeMCQData(data);
  const [selectedId, setSelectedId] = useState(null);

  const handleSelect = (option) => {
    setSelectedId(option.id);
    if (onSelectOption) {
      onSelectOption(option);
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Progress Header */}
      <div className={styles.progressHeader}>
        <button
          className={styles.backBtn}
          onClick={onBack}
          aria-label="Go back"
          type="button"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        <div className={styles.progressTrack}>
          <div
            className={styles.progressBar}
            style={{ width: `${normalizedData.progress || 33}%` }}
          >
            <div className={styles.progressShimmer}></div>
          </div>
        </div>

        <span className={styles.progressPercent}>{normalizedData.progress || 33}%</span>
      </div>

      {/* Main Card */}
      <div className={styles.card}>
        {/* AI Sparkle Icon */}
        <div className={styles.sparkleIcon}>
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
        </div>

        {/* Question Header */}
        <div className={styles.cardHeader}>
          <h1 className={styles.questionTitle}>{normalizedData.question}</h1>
          <p className={styles.questionSubtitle}>{normalizedData.description}</p>
        </div>

        {/* Options Grid */}
        <div className={styles.optionsGrid}>
          {normalizedData.options.map((opt) => {
            const isSelected = selectedId === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                className={`${styles.optionBtn} ${isSelected ? styles.selectedOption : ''}`}
                onClick={() => handleSelect(opt)}
              >
                <span className={`material-symbols-outlined ${styles.optionIcon}`}>
                  {opt.icon}
                </span>
                <span className={styles.optionLabel}>{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Bottom Info Breadcrumbs */}
        <div className={styles.bottomInfo}>
          <div className={styles.metaItem}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              folder_open
            </span>
            <span className={styles.metaText}>{normalizedData.subject}</span>
          </div>

          <div className={styles.metaItem}>
            <span className={styles.metaText}>{normalizedData.module}</span>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
              chevron_right
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickPickCard;
