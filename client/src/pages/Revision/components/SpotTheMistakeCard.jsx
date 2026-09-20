import React, { useState } from 'react';
import styles from './SpotTheMistakeCard.module.css';

const SENTENCE_TOKENS = [
  { id: 't-1', text: 'TCP' },
  { id: 't-2', text: 'is' },
  { id: 't-3', text: 'a' },
  { id: 't-4', text: 'connection-oriented' },
  { id: 't-5', text: 'protocol' },
  { id: 't-6', text: 'that' },
  { id: 't-7', text: 'provides' },
  { id: 't-8', text: 'unreliable,', isMistake: true, correction: 'reliable,' },
  { id: 't-9', text: 'ordered,' },
  { id: 't-10', text: 'and' },
  { id: 't-11', text: 'error-checked' },
  { id: 't-12', text: 'delivery' },
  { id: 't-13', text: 'of' },
  { id: 't-14', text: 'stream' },
  { id: 't-15', text: 'data.' }
];

import { normalizeSpotMistakeData } from '../mockRevisionData';

export default function SpotTheMistakeCard({ 
  data,
  onCorrect, 
  onNext,
  timerSeconds = 30,
  subject,
  topic
}) {
  const normalized = normalizeSpotMistakeData(data || {});
  const activeSubject = subject || normalized.subject || "Computer Networks";
  const activeTopic = topic || normalized.topic || "Reliable Transport Protocols";
  const tokens = normalized.tokens || SENTENCE_TOKENS;
  const explanation = normalized.explanation || "TCP is designed specifically to guarantee reliable, in-order packet delivery using acknowledgments (ACKs), sequence numbers, checksums, and retransmission timers.";

  const [selectedTokenId, setSelectedTokenId] = useState(null);
  const [isFound, setIsFound] = useState(false);
  const [wrongClickId, setWrongClickId] = useState(null);

  const handleTokenClick = (token) => {
    if (isFound) return;

    if (token.isMistake) {
      setSelectedTokenId(token.id);
      setIsFound(true);
      if (onCorrect) onCorrect();
    } else {
      setWrongClickId(token.id);
      setTimeout(() => {
        setWrongClickId(null);
      }, 700);
    }
  };

  return (
    <div className={styles.container}>
      {/* Header Meta */}
      <div className={styles.headerBar}>
        <div className={styles.badgeGroup}>
          <span className={styles.modeBadge}>
            <span className={`material-symbols-outlined ${styles.modeIcon}`} style={{ fontSize: '16px' }}>
              search_check
            </span>
            Spot the Mistake
          </span>
          <span className={styles.topicText}>{activeSubject} • {activeTopic}</span>
        </div>
        <div className={styles.timerBadge}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>timer</span>
          <span>{timerSeconds}s</span>
        </div>
      </div>

      <div className={styles.titleSection}>
        <h2 className={styles.title}>Find the Erroneous Word</h2>
        <p className={styles.subtitle}>Click on the specific word or phrase in the statement below that makes it factually incorrect.</p>
      </div>

      {/* Interactive Sentence Board */}
      <div className={styles.sentenceBoard}>
        <div className={styles.tokenContainer}>
          {tokens.map((token) => {
            const isTarget = token.id === selectedTokenId && isFound;
            const isWrong = token.id === wrongClickId;

            return (
              <button
                key={token.id}
                type="button"
                onClick={() => handleTokenClick(token)}
                disabled={isFound}
                className={`
                  ${styles.tokenBtn} 
                  ${isTarget ? styles.correctToken : ''}
                  ${isWrong ? styles.wrongToken : ''}
                `}
              >
                {isTarget ? (
                  <span className={styles.correctedWrapper}>
                    <span className={styles.struckWord}>{token.text}</span>
                    <span className={styles.replacementWord}>{token.correction}</span>
                  </span>
                ) : (
                  <span>{token.text}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Feedback & AI Explanation when Found */}
      {isFound && (
        <div className={styles.explanationSection}>
          <div className={styles.rewardBanner}>
            <div className={styles.bannerLeft}>
              <div className={styles.sparkleCircle}>
                <span className={`material-symbols-outlined ${styles.sparkleIcon}`} style={{ fontSize: '22px' }}>
                  auto_awesome
                </span>
              </div>
              <div>
                <div className={styles.bannerTitle}>NICE CATCH!</div>
                <div className={styles.bannerSubtitle}>+15 XP Earned</div>
              </div>
            </div>
            <div className={styles.bannerBadge}>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
              <span>Correct Mistake Identified</span>
            </div>
          </div>

          <div className={styles.aiExplanationCard}>
            <div className={styles.aiHeader}>
              <span className={`material-symbols-outlined ${styles.bulbIcon}`} style={{ fontSize: '18px' }}>
                lightbulb
              </span>
              <h4>AI Explanation</h4>
            </div>
            <p className={styles.aiText}>
              {explanation}
            </p>
          </div>

          <div className={styles.actionRow}>
            <button 
              type="button" 
              className={styles.continueBtn}
              onClick={onNext}
            >
              <span>Continue</span>
              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
