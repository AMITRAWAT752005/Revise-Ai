import React from 'react';
import styles from './ShortAnswerEvaluation.module.css';

const defaultEvaluation = {
  questionIndex: 4,
  totalQuestions: 10,
  question: 'Explain the concept of Neuroplasticity in simple terms.',
  userAnswer:
    'Neuroplasticity is when the brain changes its structure. Like if you learn something new, the neurons connect differently.',
  score: 8,
  maxScore: 10,
  xpEarned: 20,
  headline: 'Solid Understanding!',
  summary:
    "You've grasped the core concept perfectly, but could expand on a few details for full marks.",
  criteria: [
    {
      title: 'Core Concept Reliability',
      description: 'Accurately identified structural changes in the brain.',
      passed: true
    },
    {
      title: 'Practical Connection',
      description: 'Successfully linked learning to neural pathway adaptation.',
      passed: true
    }
  ],
  quickTip:
    'To secure a 10/10, try mentioning that neuroplasticity occurs not just during learning, but also during recovery from brain injury or adapting to new environments.'
};

const ShortAnswerEvaluation = ({
  data = defaultEvaluation,
  onNext,
  onReport,
  onBack
}) => {
  const activeData = {
    questionIndex: data?.questionIndex || 4,
    totalQuestions: data?.totalQuestions || 10,
    question: data?.question || 'What is the primary difference between TCP and UDP?',
    userAnswer: data?.userAnswer || 'TCP is connection-oriented while UDP is connectionless.',
    score: typeof data?.score === 'number' ? data.score : 8,
    maxScore: typeof data?.maxScore === 'number' ? data.maxScore : 10,
    xpEarned: typeof data?.xpEarned === 'number' ? data.xpEarned : 20,
    headline: data?.headline || 'Solid Understanding!',
    summary: data?.summary || "You've grasped the core concept perfectly.",
    criteria: Array.isArray(data?.criteria) && data.criteria.length > 0 
      ? data.criteria 
      : defaultEvaluation.criteria,
    quickTip: data?.quickTip || 'Remember to emphasize connection overhead in future responses.'
  };

  const scorePercent = Math.round(((activeData.score) / (activeData.maxScore)) * 100);
  // Calculate SVG stroke dash offset
  const dashArray = `${scorePercent}, 100`;

  return (
    <div className={styles.container}>
      {/* Top Question Context */}
      <div className={styles.contextHeader}>
        <div className={styles.headerTop}>
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
          <span className={styles.questionBadge}>
            Question {activeData.questionIndex} of {activeData.totalQuestions}
          </span>
        </div>

        <h2 className={styles.questionTitle}>{activeData.question}</h2>

        <div className={styles.userAnswerBox}>
          <p className={styles.userAnswerText}>"{activeData.userAnswer}"</p>
        </div>
      </div>

      {/* AI Evaluation Card */}
      <div className={styles.evalCard}>
        {/* Floating XP Reward Badge */}
        <div className={styles.xpFloatingBadge}>
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1", fontSize: '18px' }}
          >
            workspace_premium
          </span>
          <span>+{activeData.xpEarned} XP</span>
        </div>

        {/* AI Sparkle */}
        <div className={styles.sparkleIcon}>
          <span
            className="material-symbols-outlined"
            style={{ fontVariationSettings: "'FILL' 1", fontSize: '28px' }}
          >
            auto_awesome
          </span>
        </div>

        {/* Score & Summary */}
        <div className={styles.scoreSection}>
          <div className={styles.scoreRing}>
            <svg className={styles.scoreSvg} viewBox="0 0 36 36">
              <path
                className={styles.scoreBgTrack}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={styles.scoreProgressTrack}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                strokeDasharray={dashArray}
              />
            </svg>
            <div className={styles.scoreTextOverlay}>
              <span className={styles.currentScore}>{activeData.score}</span>
              <span className={styles.maxScore}>/ {activeData.maxScore}</span>
            </div>
          </div>

          <div className={styles.summaryTextGroup}>
            <h3 className={styles.evalHeadline}>{activeData.headline}</h3>
            <p className={styles.evalSummary}>{activeData.summary}</p>
          </div>
        </div>

        {/* Criteria Breakdown */}
        <div className={styles.criteriaGrid}>
          {activeData.criteria.map((item, idx) => (
            <div key={idx} className={styles.criteriaItem}>
              <div className={styles.checkCircle}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  check
                </span>
              </div>
              <div>
                <h4 className={styles.criteriaTitle}>{item.title}</h4>
                <p className={styles.criteriaDescription}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* AI Quick Tip */}
        <div className={styles.quickTipCard}>
          <div className={styles.tipIcon}>
            <span
              className="material-symbols-outlined"
              style={{ fontVariationSettings: "'FILL' 1", fontSize: '24px' }}
            >
              lightbulb
            </span>
          </div>
          <div>
            <h4 className={styles.tipTitle}>AI Quick Tip</h4>
            <p className={styles.tipText}>{activeData.quickTip}</p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className={styles.footerActions}>
        <button
          type="button"
          className={styles.reportBtn}
          onClick={onReport}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
            flag
          </span>
          <span>Report Issue</span>
        </button>

        <button
          type="button"
          className={styles.nextBtn}
          onClick={onNext}
        >
          <span>Next Question</span>
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
            arrow_forward
          </span>
        </button>
      </div>
    </div>
  );
};

export default ShortAnswerEvaluation;
