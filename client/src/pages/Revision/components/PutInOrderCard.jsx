import React, { useState } from 'react';
import styles from './PutInOrderCard.module.css';

const INITIAL_STEPS = [
  { id: 'step-2', label: 'SYN-ACK', title: 'Server responds with SYN-ACK', desc: 'Server allocates buffers and acknowledges client request while proposing initial server sequence number', correctPos: 1 },
  { id: 'step-1', label: 'SYN', title: 'Client sends SYN packet', desc: 'Client initiates connection by sending a synchronize packet with random initial sequence number', correctPos: 0 },
  { id: 'step-3', label: 'ACK', title: 'Client returns ACK packet', desc: 'Client acknowledges server synchronization; connection transitions to ESTABLISHED state', correctPos: 2 }
];

import { normalizeSequenceData } from '../mockRevisionData';

export default function PutInOrderCard({ 
  data,
  onCorrect, 
  onNext,
  title,
  instruction,
  subject,
  topic
}) {
  const normalized = normalizeSequenceData(data || {});
  const activeTitle = title || normalized.title || "TCP 3-Way Handshake";
  const activeInstruction = instruction || normalized.instruction || "Arrange the packets in the correct chronological sequence to establish a connection.";
  const activeSubject = subject || normalized.subject || "Computer Networks";
  const activeTopic = topic || normalized.topic || "Transport Layer";
  const initialItems = normalized.items || INITIAL_STEPS;

  const [items, setItems] = useState(initialItems);
  const [isChecked, setIsChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const moveItem = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const newItems = [...items];
    const [movedItem] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, movedItem);
    setItems(newItems);
    setIsChecked(false);
    setIsCorrect(false);
  };

  const handleCheckOrder = () => {
    const isOrderPerfect = items.every((item, idx) => item.correctPos === idx);
    setIsChecked(true);
    setIsCorrect(isOrderPerfect);
    if (isOrderPerfect && onCorrect) {
      onCorrect();
    }
  };

  const handleReset = () => {
    setItems([...initialItems]);
    setIsChecked(false);
    setIsCorrect(false);
  };

  return (
    <div className={styles.container}>
      {/* Top Meta Bar */}
      <div className={styles.headerBar}>
        <div className={styles.badgeGroup}>
          <span className={styles.modeBadge}>
            <span className={`material-symbols-outlined ${styles.modeIcon}`} style={{ fontSize: '16px' }}>
              format_list_numbered
            </span>
            Put in Order (Immersion)
          </span>
          <span className={styles.topicText}>{activeSubject} • {activeTopic}</span>
        </div>
        <div className={styles.hintBadge}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>help_outline</span>
          <span>Step 1 to {items.length}</span>
        </div>
      </div>

      <div className={styles.titleSection}>
        <h2 className={styles.title}>{activeTitle}</h2>
        <p className={styles.subtitle}>{activeInstruction}</p>
      </div>

      {/* Sequence List */}
      <div className={styles.listContainer}>
        {items.map((item, index) => {
          const isItemCorrect = isChecked && item.correctPos === index;
          const isItemWrong = isChecked && item.correctPos !== index;

          return (
            <div 
              key={item.id}
              className={`
                ${styles.orderCard} 
                ${isItemCorrect ? styles.correctCard : ''}
                ${isItemWrong ? styles.wrongCard : ''}
              `}
            >
              <div className={styles.gripArea}>
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>drag_indicator</span>
              </div>

              <div className={styles.rankBadge}>
                <span>{index + 1}</span>
              </div>

              <div className={styles.itemContent}>
                <div className={styles.packetHeader}>
                  <span className={styles.packetPill}>{item.label}</span>
                  <h3 className={styles.packetTitle}>{item.title}</h3>
                </div>
                <p className={styles.packetDesc}>{item.desc}</p>
              </div>

              <div className={styles.actionsArea}>
                <button
                  type="button"
                  className={styles.moveBtn}
                  onClick={() => moveItem(index, -1)}
                  disabled={index === 0}
                  aria-label="Move Up"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_upward</span>
                </button>
                <button
                  type="button"
                  className={styles.moveBtn}
                  onClick={() => moveItem(index, 1)}
                  disabled={index === items.length - 1}
                  aria-label="Move Down"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_downward</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Result Overlay / Feedback */}
      {isChecked && isCorrect && (
        <div className={styles.successBanner}>
          <div className={styles.successLeft}>
            <div className={styles.sparkleCircle}>
              <span className={`material-symbols-outlined ${styles.sparkleIcon}`} style={{ fontSize: '22px' }}>
                auto_awesome
              </span>
            </div>
            <div>
              <div className={styles.successTitle}>PERFECT SEQUENCE!</div>
              <div className={styles.successSubtitle}>SYN ➔ SYN-ACK ➔ ACK established successfully. +15 XP</div>
            </div>
          </div>
          <button 
            type="button" 
            className={styles.nextBtn}
            onClick={onNext}
          >
            <span>Next Question</span>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
          </button>
        </div>
      )}

      {isChecked && !isCorrect && (
        <div className={styles.errorBanner}>
          <div className={styles.errorText}>
            Not quite right. Think about who initiates the handshake and who acknowledges next!
          </div>
          <button 
            type="button" 
            className={styles.retryBtn}
            onClick={handleReset}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>restart_alt</span>
            <span>Try Again</span>
          </button>
        </div>
      )}

      {/* Footer Controls */}
      <div className={styles.footerControls}>
        <button 
          type="button" 
          className={styles.resetBtn}
          onClick={handleReset}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>restart_alt</span>
          <span>Reset Order</span>
        </button>

        {!isCorrect && (
          <button 
            type="button" 
            className={styles.checkBtn}
            onClick={handleCheckOrder}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
            <span>Check Sequence</span>
          </button>
        )}
      </div>
    </div>
  );
}
