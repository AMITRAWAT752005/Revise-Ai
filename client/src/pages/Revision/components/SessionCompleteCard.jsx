import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SessionCompleteCard.module.css';

export default function SessionCompleteCard({ 
  onRestart,
  totalQuestions = 17,
  correctCount = 16,
  xpEarned = 120,
  streakDays = 7,
  timeSpent = "4m 12s",
  subject = "Computer Science & Engineering"
}) {
  const navigate = useNavigate();
  const accuracy = Math.round((correctCount / totalQuestions) * 100);

  const handleReturnDashboard = () => {
    navigate('/home');
  };

  return (
    <div className={styles.container}>
      {/* Confetti & Spark Background Effects */}
      <div className={styles.sparkleOverlay} />

      {/* Hero Celebration */}
      <div className={styles.heroSection}>
        <div className={styles.trophyWrapper}>
          <div className={styles.trophyCircle}>
            <span className={`material-symbols-outlined ${styles.trophyIcon}`} style={{ fontSize: '52px', fontVariationSettings: "'FILL' 1" }}>
              emoji_events
            </span>
          </div>
          <div className={styles.sparkleFloat}>
            <span className={`material-symbols-outlined ${styles.sparkleIcon}`} style={{ fontSize: '20px' }}>
              auto_awesome
            </span>
          </div>
        </div>

        <h1 className={styles.heroTitle}>Revision Session Complete!</h1>
        <p className={styles.heroSubtitle}>
          Outstanding focus! You've reinforced your core concepts and kept your study streak blazing.
        </p>
      </div>

      {/* Core Metrics Grid */}
      <div className={styles.metricsGrid}>
        {/* XP Card */}
        <div className={styles.metricCard}>
          <div className={styles.metricIconWrapXp}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>workspace_premium</span>
          </div>
          <div className={styles.metricValue}>+{xpEarned}</div>
          <div className={styles.metricLabel}>Total XP Earned</div>
        </div>

        {/* Accuracy Card */}
        <div className={styles.metricCard}>
          <div className={styles.metricIconWrapAccuracy}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>check_circle</span>
          </div>
          <div className={styles.metricValue}>{accuracy}%</div>
          <div className={styles.metricLabel}>{correctCount}/{totalQuestions} Correct</div>
        </div>

        {/* Streak Card */}
        <div className={styles.metricCard}>
          <div className={styles.metricIconWrapStreak}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px', fontVariationSettings: "'FILL' 1" }}>
              local_fire_department
            </span>
          </div>
          <div className={styles.metricValue}>{streakDays} Days</div>
          <div className={styles.metricLabel}>Daily Spark Streak</div>
        </div>

        {/* Time Card */}
        <div className={styles.metricCard}>
          <div className={styles.metricIconWrapTime}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>schedule</span>
          </div>
          <div className={styles.metricValue}>{timeSpent}</div>
          <div className={styles.metricLabel}>Time Focused</div>
        </div>
      </div>

      {/* Topic Mastery Breakdown */}
      <div className={styles.breakdownSection}>
        <div className={styles.breakdownHeader}>
          <span className={`material-symbols-outlined ${styles.breakdownIcon}`} style={{ fontSize: '20px' }}>
            trending_up
          </span>
          <h3>Topic Mastery Breakdown</h3>
        </div>

        <div className={styles.topicList}>
          <div className={styles.topicItem}>
            <div className={styles.topicMeta}>
              <span className={styles.topicName}>Transport & Application Layer Protocols</span>
              <span className={styles.topicScore}>100% Mastery</span>
            </div>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{ width: '100%' }} />
            </div>
          </div>

          <div className={styles.topicItem}>
            <div className={styles.topicMeta}>
              <span className={styles.topicName}>Memory Hierarchy & Cache Latencies</span>
              <span className={styles.topicScore}>94% Mastery</span>
            </div>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{ width: '94%' }} />
            </div>
          </div>

          <div className={styles.topicItem}>
            <div className={styles.topicMeta}>
              <span className={styles.topicName}>CPU Process Scheduling & Starvation</span>
              <span className={styles.topicScore}>88% Mastery</span>
            </div>
            <div className={styles.progressBarBg}>
              <div className={styles.progressBarFill} style={{ width: '88%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className={styles.actionsRow}>
        <button 
          type="button" 
          className={styles.secondaryBtn}
          onClick={onRestart}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>restart_alt</span>
          <span>Revise Again</span>
        </button>

        <button 
          type="button" 
          className={styles.primaryBtn}
          onClick={handleReturnDashboard}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>home</span>
          <span>Return to Dashboard</span>
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
        </button>
      </div>
    </div>
  );
}
