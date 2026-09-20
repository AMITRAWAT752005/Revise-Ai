import React, { useState } from 'react';
import styles from './MatchItCard.module.css';

const DEFAULT_PAIRS = [
  { id: '1', concept: 'TCP', definition: 'Connection-oriented, guaranteed byte-stream delivery with congestion control' },
  { id: '2', concept: 'UDP', definition: 'Connectionless, lightweight datagram protocol with minimal latency' },
  { id: '3', concept: 'DNS', definition: 'Hierarchical naming system resolving domain names to IP addresses' },
  { id: '4', concept: 'BGP', definition: 'Exterior gateway routing protocol managing paths across autonomous systems' }
];

import { normalizeMatchData } from '../mockRevisionData';

export default function MatchItCard({ 
  data,
  onCorrect, 
  onNext,
  timerSeconds = 45,
  subject,
  topic
}) {
  const normalized = normalizeMatchData(data || {});
  const activeSubject = subject || normalized.subject || "Computer Networks";
  const activeTopic = topic || normalized.topic || "Transport & Routing Protocols";
  const pairs = normalized.pairs;

  const [selectedConcept, setSelectedConcept] = useState(null);
  const [matches, setMatches] = useState({}); // { conceptId: definitionId }
  const [mismatched, setMismatched] = useState(null); // { conceptId, defId }
  const [isCompleted, setIsCompleted] = useState(false);

  // Scramble definitions for display on the right
  const [scrambledDefs] = useState(() => {
    return [...pairs].sort(() => Math.random() - 0.5);
  });

  const handleConceptClick = (item) => {
    if (matches[item.id]) return; // already matched
    setSelectedConcept(item.id === selectedConcept ? null : item.id);
    setMismatched(null);
  };

  const handleDefClick = (defItem) => {
    if (Object.values(matches).includes(defItem.id)) return; // already matched
    if (!selectedConcept) return;

    // Check if correct match
    if (selectedConcept === defItem.id) {
      const newMatches = { ...matches, [selectedConcept]: defItem.id };
      setMatches(newMatches);
      setSelectedConcept(null);
      setMismatched(null);

      if (Object.keys(newMatches).length === pairs.length) {
        setIsCompleted(true);
        if (onCorrect) onCorrect();
      }
    } else {
      // Wrong match
      setMismatched({ conceptId: selectedConcept, defId: defItem.id });
      setTimeout(() => {
        setMismatched(null);
        setSelectedConcept(null);
      }, 1000);
    }
  };

  const handleReset = () => {
    setMatches({});
    setSelectedConcept(null);
    setMismatched(null);
    setIsCompleted(false);
  };

  const matchedCount = Object.keys(matches).length;
  const totalCount = pairs.length;

  return (
    <div className={styles.container}>
      {/* Top Meta Bar */}
      <div className={styles.headerBar}>
        <div className={styles.badgeGroup}>
          <span className={styles.modeBadge}>
            <span className={`material-symbols-outlined ${styles.modeIcon}`} style={{ fontSize: '16px' }}>
              sync_alt
            </span>
            Match It
          </span>
          <span className={styles.topicText}>{activeSubject} • {activeTopic}</span>
        </div>
        <div className={styles.statusGroup}>
          <div className={styles.timerBadge}>
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>timer</span>
            <span>{timerSeconds}s</span>
          </div>
          <div className={styles.matchedBadge}>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check_circle</span>
            <span>{matchedCount}/{totalCount} Matched</span>
          </div>
        </div>
      </div>

      <div className={styles.titleSection}>
        <h2 className={styles.title}>Connect Matching Terms & Definitions</h2>
        <p className={styles.subtitle}>Select a concept on the left, then click its corresponding definition on the right.</p>
      </div>

      {/* Matching Grid */}
      <div className={styles.matchingGrid}>
        {/* Left Column: Concepts */}
        <div className={styles.column}>
          <div className={styles.columnHeader}>Concepts</div>
          {pairs.map((item) => {
            const isMatched = !!matches[item.id];
            const isSelected = selectedConcept === item.id;
            const isError = mismatched?.conceptId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleConceptClick(item)}
                disabled={isMatched}
                className={`
                  ${styles.matchCard} 
                  ${isSelected ? styles.selectedCard : ''} 
                  ${isMatched ? styles.matchedCard : ''}
                  ${isError ? styles.errorCard : ''}
                `}
              >
                <div className={styles.cardContent}>
                  <div className={styles.conceptName}>{item.concept}</div>
                  <div className={styles.connectionPort}>
                    {isMatched ? (
                      <span className={`material-symbols-outlined ${styles.portCheck}`} style={{ fontSize: '16px' }}>
                        check
                      </span>
                    ) : (
                      <div className={styles.portDot} />
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Definitions */}
        <div className={styles.column}>
          <div className={styles.columnHeader}>Definitions</div>
          {scrambledDefs.map((item) => {
            const isMatched = Object.values(matches).includes(item.id);
            const isError = mismatched?.defId === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleDefClick(item)}
                disabled={isMatched}
                className={`
                  ${styles.matchCard} 
                  ${styles.defCard}
                  ${isMatched ? styles.matchedCard : ''}
                  ${isError ? styles.errorCard : ''}
                `}
              >
                <div className={styles.cardContent}>
                  <div className={styles.connectionPortLeft}>
                    {isMatched ? (
                      <span className={`material-symbols-outlined ${styles.portCheck}`} style={{ fontSize: '16px' }}>
                        check
                      </span>
                    ) : (
                      <div className={styles.portDot} />
                    )}
                  </div>
                  <div className={styles.defText}>{item.definition}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Completion Banner */}
      {isCompleted && (
        <div className={styles.completedBanner}>
          <div className={styles.completedLeft}>
            <div className={styles.sparkleCircle}>
              <span className={`material-symbols-outlined ${styles.sparkleIcon}`} style={{ fontSize: '22px' }}>
                auto_awesome
              </span>
            </div>
            <div>
              <div className={styles.completedTitle}>ALL MATCHED PERFECTLY!</div>
              <div className={styles.completedSubtitle}>You earned +15 XP for quick recall</div>
            </div>
          </div>
          <button 
            type="button" 
            className={styles.nextBtn}
            onClick={onNext}
          >
            <span>Continue</span>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
          </button>
        </div>
      )}

      {/* Bottom Footer Controls */}
      <div className={styles.footerControls}>
        <button 
          type="button" 
          className={styles.resetBtn}
          onClick={handleReset}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>restart_alt</span>
          <span>Reset Matches</span>
        </button>
      </div>
    </div>
  );
}
