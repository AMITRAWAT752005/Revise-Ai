import React, { useState } from 'react';
import styles from './RankItCard.module.css';

const INITIAL_ITEMS = [
  { id: 'ram', name: 'RAM (Random Access Memory)', desc: 'Volatile main memory (DRAM)', correctRank: 2 },
  { id: 'hdd', name: 'HDD (Hard Disk Drive)', desc: 'Magnetic spinning platters with mechanical seek times', correctRank: 4 },
  { id: 'cache', name: 'CPU Cache (L1/L2/L3)', desc: 'SRAM built directly into the processor die', correctRank: 1 },
  { id: 'ssd', name: 'SSD (Solid State Drive)', desc: 'Non-volatile high-speed NAND flash storage', correctRank: 3 }
];

export default function RankItCard({ 
  data,
  onCorrect, 
  onNext,
  title,
  instruction,
  subject,
  topic
}) {
  const activeTitle = data?.title || title || "Rank Memory Hierarchy";
  const activeInstruction = data?.instruction || instruction || "Arrange the storage types from FASTEST to SLOWEST access latency.";
  const activeSubject = data?.subject || subject || "Computer Architecture";
  const activeTopic = data?.topic || topic || "Memory Hierarchy & Latency";
  const initialItems = data?.items || INITIAL_ITEMS;

  const [items, setItems] = useState(initialItems);
  const [isChecked, setIsChecked] = useState(false);
  const [isPerfect, setIsPerfect] = useState(false);

  const moveItem = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const newItems = [...items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(target, 0, moved);
    setItems(newItems);
    setIsChecked(false);
    setIsPerfect(false);
  };

  const handleCheck = () => {
    const isOrderCorrect = items.every((item, idx) => item.correctRank === idx + 1);
    setIsChecked(true);
    setIsPerfect(isOrderCorrect);
    if (isOrderCorrect && onCorrect) {
      onCorrect();
    }
  };

  const handleReset = () => {
    setItems([...initialItems]);
    setIsChecked(false);
    setIsPerfect(false);
  };

  return (
    <div className={styles.container}>
      {/* Header Meta */}
      <div className={styles.headerBar}>
        <div className={styles.badgeGroup}>
          <span className={styles.modeBadge}>
            <span className={`material-symbols-outlined ${styles.modeIcon}`} style={{ fontSize: '16px' }}>
              swap_vert
            </span>
            Rank It
          </span>
          <span className={styles.topicText}>{activeSubject} • {activeTopic}</span>
        </div>
        <div className={styles.sparkleBadge}>
          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>auto_awesome</span>
          <span>+15 XP</span>
        </div>
      </div>

      <div className={styles.titleSection}>
        <h2 className={styles.title}>{activeTitle}</h2>
        <p className={styles.subtitle}>{activeInstruction}</p>
      </div>

      {/* Main Game Area with Visual Track Indicators */}
      <div className={styles.gameArea}>
        {/* Track Label Left */}
        <div className={styles.trackIndicator}>
          <span className={styles.fastLabel}>FASTEST</span>
          <div className={styles.trackBar} />
          <span className={styles.slowLabel}>SLOWEST</span>
        </div>

        {/* List of Draggable Items */}
        <div className={styles.itemsList}>
          {items.map((item, index) => {
            const isItemCorrect = isChecked && item.correctRank === index + 1;
            const isItemWrong = isChecked && item.correctRank !== index + 1;

            return (
              <div 
                key={item.id}
                className={`
                  ${styles.rankCard} 
                  ${isItemCorrect ? styles.correctRankCard : ''}
                  ${isItemWrong ? styles.wrongRankCard : ''}
                `}
              >
                <div className={styles.dragHandle}>
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>drag_indicator</span>
                </div>

                <div className={styles.rankNumberCircle}>
                  <span>{index + 1}</span>
                </div>

                <div className={styles.rankCardBody}>
                  <div className={styles.rankItemName}>{item.name}</div>
                  <div className={styles.rankItemDesc}>{item.desc}</div>
                </div>

                {isItemCorrect && (
                  <span className={`material-symbols-outlined ${styles.checkIcon}`} style={{ fontSize: '22px' }}>
                    check_circle
                  </span>
                )}

                <div className={styles.arrowControls}>
                  <button
                    type="button"
                    onClick={() => moveItem(index, -1)}
                    disabled={index === 0}
                    className={styles.arrowBtn}
                    aria-label="Move Up"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>arrow_upward</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItem(index, 1)}
                    disabled={index === items.length - 1}
                    className={styles.arrowBtn}
                    aria-label="Move Down"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>arrow_downward</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Perfect Order Overlay Modal */}
        {isChecked && isPerfect && (
          <div className={styles.perfectOverlay}>
            <div className={styles.perfectCard}>
              <div className={styles.awardCircle}>
                <span className={`material-symbols-outlined ${styles.awardIcon}`} style={{ fontSize: '36px', fontVariationSettings: "'FILL' 1" }}>
                  military_tech
                </span>
              </div>
              <h3 className={styles.perfectTitle}>PERFECT ORDER!</h3>
              <p className={styles.perfectSubtext}>
                CPU Cache (~1ns) ➔ RAM (~50ns) ➔ NVMe SSD (~10µs) ➔ HDD (~5ms)
              </p>
              <div className={styles.xpPill}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>auto_awesome</span>
                <span>+15 XP Reward</span>
              </div>
              <button 
                type="button" 
                className={styles.overlayNextBtn}
                onClick={onNext}
              >
                <span>Next Challenge</span>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>arrow_forward</span>
              </button>
            </div>
          </div>
        )}
      </div>

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

        {!isPerfect && (
          <button 
            type="button" 
            className={styles.checkBtn}
            onClick={handleCheck}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>check</span>
            <span>Check Ranking</span>
          </button>
        )}
      </div>
    </div>
  );
}
