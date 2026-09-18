import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SideNavBar from '../../components/Navigation/SideNavBar';
import BottomNavBar from '../../components/Navigation/BottomNavBar';

// Prompt 1 Components
import QuickPickCard from './components/QuickPickCard';
import FillTheGapCard from './components/FillTheGapCard';
import FlashcardCard from './components/FlashcardCard';
import ShortAnswerCard from './components/ShortAnswerCard';
import ShortAnswerEvaluation from './components/ShortAnswerEvaluation';
import CorrectFeedbackModal from './components/CorrectFeedbackModal';
import WrongFeedbackModal from './components/WrongFeedbackModal';
import ComboRewardModal from './components/ComboRewardModal';

// Prompt 2 Components
import MatchItCard from './components/MatchItCard';
import PutInOrderCard from './components/PutInOrderCard';
import SpotTheMistakeCard from './components/SpotTheMistakeCard';
import TrueFalseCard from './components/TrueFalseCard';
import ScenarioChoiceCard from './components/ScenarioChoiceCard';
import WhatHappensNextCard from './components/WhatHappensNextCard';
import RankItCard from './components/RankItCard';
import SessionCompleteCard from './components/SessionCompleteCard';

import styles from './Revision.module.css';

const STITCH_MODES = [
  { id: 'quick_pick', label: '1. Quick Pick' },
  { id: 'fill_gap', label: '2. Fill Gap' },
  { id: 'flashcard_front', label: '3. Flashcard Front' },
  { id: 'flashcard_back', label: '4. Flashcard Back' },
  { id: 'short_answer', label: '5. Short Answer' },
  { id: 'evaluation', label: '6. AI Evaluation' },
  { id: 'match_it', label: '7. Match It' },
  { id: 'put_in_order', label: '8. Put in Order' },
  { id: 'spot_mistake', label: '9. Spot Mistake' },
  { id: 'true_false', label: '10. True / False' },
  { id: 'scenario_choice', label: '11. Scenario Choice' },
  { id: 'what_happens_next', label: '12. What Next?' },
  { id: 'rank_it', label: '13. Rank It' },
  { id: 'correct_feedback', label: '14. Correct Feedback' },
  { id: 'wrong_feedback', label: '15. Wrong Feedback' },
  { id: 'combo_reward', label: '16. Combo Reward' },
  { id: 'session_complete', label: '17. Session Complete' }
];

const Revision = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [currentMode, setCurrentMode] = useState('quick_pick');
  const [userAnswer, setUserAnswer] = useState('');
  const [totalXpEarned, setTotalXpEarned] = useState(820);
  const [streakCount, setStreakCount] = useState(7);
  const [correctAnswersCount, setCorrectAnswersCount] = useState(14);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }

    const modeParam = searchParams.get('mode');
    if (modeParam && STITCH_MODES.some((m) => m.id === modeParam)) {
      setCurrentMode(modeParam);
      setSessionActive(true);
    }
  }, [searchParams]);

  const handleStartNow = () => {
    setSessionActive(true);
    setCurrentMode('quick_pick');
  };

  const handleMaybeLater = () => {
    navigate('/home');
  };

  const handleSelectMode = (modeId) => {
    setCurrentMode(modeId);
    setSessionActive(true);
    setSearchParams({ mode: modeId });
  };

  // Progression Flow Handlers
  const handleQuickPickOption = (option) => {
    if (option.isCorrect) {
      setTotalXpEarned((prev) => prev + 10);
      setCorrectAnswersCount((prev) => prev + 1);
      setCurrentMode('correct_feedback');
    } else {
      setCurrentMode('wrong_feedback');
    }
  };

  const handleFillGapContinue = (isCorrect) => {
    if (isCorrect) {
      setTotalXpEarned((prev) => prev + 15);
      setCorrectAnswersCount((prev) => prev + 1);
    }
    setCurrentMode('match_it');
  };

  const handleMatchItNext = () => {
    setTotalXpEarned((prev) => prev + 15);
    setCorrectAnswersCount((prev) => prev + 1);
    setCurrentMode('put_in_order');
  };

  const handlePutInOrderNext = () => {
    setTotalXpEarned((prev) => prev + 15);
    setCorrectAnswersCount((prev) => prev + 1);
    setCurrentMode('spot_mistake');
  };

  const handleSpotMistakeNext = () => {
    setTotalXpEarned((prev) => prev + 15);
    setCorrectAnswersCount((prev) => prev + 1);
    setCurrentMode('true_false');
  };

  const handleTrueFalseNext = () => {
    setTotalXpEarned((prev) => prev + 10);
    setCorrectAnswersCount((prev) => prev + 1);
    setCurrentMode('scenario_choice');
  };

  const handleScenarioChoiceNext = () => {
    setTotalXpEarned((prev) => prev + 15);
    setCorrectAnswersCount((prev) => prev + 1);
    setCurrentMode('what_happens_next');
  };

  const handleWhatHappensNext = () => {
    setTotalXpEarned((prev) => prev + 15);
    setCorrectAnswersCount((prev) => prev + 1);
    setCurrentMode('rank_it');
  };

  const handleRankItNext = () => {
    setTotalXpEarned((prev) => prev + 15);
    setCorrectAnswersCount((prev) => prev + 1);
    setCurrentMode('flashcard_front');
  };

  const handleFlashcardRate = (rating) => {
    const xpBonus = rating === 'easy' ? 15 : rating === 'good' ? 10 : 5;
    setTotalXpEarned((prev) => prev + xpBonus);
    setCorrectAnswersCount((prev) => prev + 1);
    setCurrentMode('short_answer');
  };

  const handleShortAnswerSubmit = (submittedText) => {
    setUserAnswer(submittedText);
    setTotalXpEarned((prev) => prev + 20);
    setCurrentMode('evaluation');
  };

  const handleEvaluationNext = () => {
    setCurrentMode('combo_reward');
  };

  const handleComboContinue = () => {
    setTotalXpEarned((prev) => prev + 25);
    setStreakCount((prev) => prev + 1);
    setCurrentMode('session_complete');
  };

  const handleRestartSession = () => {
    setCurrentMode('quick_pick');
  };

  return (
    <div className={styles.revisionContainer}>
      {/* Desktop Sidebar Navigation */}
      <SideNavBar
        user={user}
        xpEarned={totalXpEarned}
        onQuickRevision={handleStartNow}
      />

      {/* Main Workspace */}
      <main className={styles.mainWorkspace}>
        {/* Top App Bar */}
        <header className={styles.topBar}>
          <div className={styles.brandGroup}>
            <button
              className={styles.mobileMenuBtn}
              onClick={() => navigate('/home')}
              aria-label="Back to Home"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <span className={styles.mobileLogoTitle}>ReviseAI</span>
          </div>

          <div className={styles.topActions}>
            <div className={styles.streakBadge} title="Active Streak">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1", color: '#ea580c' }}
              >
                local_fire_department
              </span>
              <span className={styles.streakNumber}>{streakCount}</span>
            </div>

            <div className={styles.xpBadge} title="Total XP Earned">
              <span
                className="material-symbols-outlined"
                style={{ fontVariationSettings: "'FILL' 1", color: '#ffd700' }}
              >
                workspace_premium
              </span>
              <span className={styles.xpNumber}>{totalXpEarned} XP</span>
            </div>

            <button
              className={styles.iconBtn}
              onClick={() => navigate('/settings')}
              title="Settings"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
        </header>

        {/* Stitch Screen Switcher / Stepper Tab Bar */}
        {sessionActive && (
          <div className={styles.tabBarWrapper}>
            <div className={styles.tabBar}>
              {STITCH_MODES.map((mode) => {
                const isActive = currentMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    className={`${styles.tabBtn} ${
                      isActive ? styles.activeTabBtn : ''
                    }`}
                    onClick={() => handleSelectMode(mode.id)}
                  >
                    {mode.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Canvas */}
        <div className={styles.contentCanvas}>
          {!sessionActive ? (
            /* ==================================================== */
            /* COMMITMENT PROMPT MODAL (ENTRY SCREEN)               */
            /* ==================================================== */
            <div className={styles.modalOverlay}>
              <div
                className={styles.modalCard}
                role="dialog"
                aria-modal="true"
                aria-labelledby="commitment-title"
              >
                <div className={styles.dragHandle}></div>

                <div className={styles.iconContainer}>
                  <span
                    className={`material-symbols-outlined ${styles.sparkleIcon}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                </div>

                <h2 id="commitment-title" className={styles.modalTitle}>
                  Ready to lock in?
                </h2>

                <p className={styles.modalDescription}>
                  10 minutes is all it takes to make it stick. Complete the daily
                  interactive revision session to keep your streak glowing!
                </p>

                <div className={styles.actionGroup}>
                  <button
                    className={styles.startNowBtn}
                    onClick={handleStartNow}
                  >
                    <span>Start Now</span>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: '18px' }}
                    >
                      arrow_forward
                    </span>
                  </button>
                  <button
                    className={styles.maybeLaterBtn}
                    onClick={handleMaybeLater}
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* ==================================================== */
            /* ACTIVE STITCH REVISION SCREENS (PROMPTS 1 & 2)       */
            /* ==================================================== */
            <div className={styles.screenRenderer}>
              {/* 1. Quick Pick */}
              {currentMode === 'quick_pick' && (
                <QuickPickCard
                  onSelectOption={handleQuickPickOption}
                  onBack={() => setSessionActive(false)}
                />
              )}

              {/* 2. Fill the Gap */}
              {currentMode === 'fill_gap' && (
                <FillTheGapCard
                  onContinue={handleFillGapContinue}
                  onBack={() => setCurrentMode('quick_pick')}
                />
              )}

              {/* 3. Flashcard Front */}
              {currentMode === 'flashcard_front' && (
                <FlashcardCard
                  initialFlipped={false}
                  onRate={handleFlashcardRate}
                  onBack={() => setCurrentMode('rank_it')}
                />
              )}

              {/* 4. Flashcard Back */}
              {currentMode === 'flashcard_back' && (
                <FlashcardCard
                  initialFlipped={true}
                  onRate={handleFlashcardRate}
                  onBack={() => setCurrentMode('flashcard_front')}
                />
              )}

              {/* 5. Short Answer Empty/Input */}
              {currentMode === 'short_answer' && (
                <ShortAnswerCard
                  onSubmit={handleShortAnswerSubmit}
                  onBack={() => setCurrentMode('flashcard_front')}
                />
              )}

              {/* 6. AI Short Answer Evaluation */}
              {currentMode === 'evaluation' && (
                <ShortAnswerEvaluation
                  data={{
                    questionIndex: 6,
                    totalQuestions: 17,
                    question: 'What is the primary difference between TCP and UDP?',
                    userAnswer:
                      userAnswer ||
                      'TCP is connection-oriented and provides reliable, ordered data delivery with error checking. UDP is connectionless and lightweight without delivery guarantees.',
                    score: 9,
                    maxScore: 10,
                    xpEarned: 20,
                    headline: 'Outstanding Precision!',
                    summary:
                      "You've grasped the core distinction between reliability, handshake overhead, and streaming throughput.",
                    criteria: [
                      {
                        title: 'Connection Type Distinction',
                        description:
                          'Accurately identified TCP as connection-oriented and UDP as connectionless.',
                        passed: true
                      },
                      {
                        title: 'Reliability & Flow Control',
                        description:
                          'Correctly explained packet acknowledgment and retransmission trade-offs.',
                        passed: true
                      }
                    ],
                    quickTip:
                      'Mentioning real-world protocols (TCP for HTTP/TLS, UDP for DNS/WebRTC) adds extra depth to exam answers.'
                  }}
                  onNext={handleEvaluationNext}
                  onReport={() => alert('Feedback noted for AI fine-tuning.')}
                  onBack={() => setCurrentMode('short_answer')}
                />
              )}

              {/* 7. Match It (Prompt 2) */}
              {currentMode === 'match_it' && (
                <MatchItCard
                  onCorrect={() => {}}
                  onNext={handleMatchItNext}
                />
              )}

              {/* 8. Put in Order / Immersion (Prompt 2) */}
              {currentMode === 'put_in_order' && (
                <PutInOrderCard
                  onCorrect={() => {}}
                  onNext={handlePutInOrderNext}
                />
              )}

              {/* 9. Spot the Mistake (Prompt 2) */}
              {currentMode === 'spot_mistake' && (
                <SpotTheMistakeCard
                  onCorrect={() => {}}
                  onNext={handleSpotMistakeNext}
                />
              )}

              {/* 10. True / False (Prompt 2) */}
              {currentMode === 'true_false' && (
                <TrueFalseCard
                  onCorrect={() => {}}
                  onNext={handleTrueFalseNext}
                />
              )}

              {/* 11. Scenario Choice (Prompt 2) */}
              {currentMode === 'scenario_choice' && (
                <ScenarioChoiceCard
                  onCorrect={() => {}}
                  onNext={handleScenarioChoiceNext}
                />
              )}

              {/* 12. What Happens Next? (Prompt 2) */}
              {currentMode === 'what_happens_next' && (
                <WhatHappensNextCard
                  onCorrect={() => {}}
                  onNext={handleWhatHappensNext}
                />
              )}

              {/* 13. Rank It (Prompt 2) */}
              {currentMode === 'rank_it' && (
                <RankItCard
                  onCorrect={() => {}}
                  onNext={handleRankItNext}
                />
              )}

              {/* 14. Correct Feedback Modal */}
              {currentMode === 'correct_feedback' && (
                <CorrectFeedbackModal
                  onNext={() => setCurrentMode('fill_gap')}
                  onAgain={() => setCurrentMode('quick_pick')}
                />
              )}

              {/* 15. Wrong Feedback Modal */}
              {currentMode === 'wrong_feedback' && (
                <WrongFeedbackModal
                  onGotIt={() => setCurrentMode('fill_gap')}
                  onTryAgain={() => setCurrentMode('quick_pick')}
                  onBack={() => setCurrentMode('quick_pick')}
                />
              )}

              {/* 16. Combo Reward Modal */}
              {currentMode === 'combo_reward' && (
                <ComboRewardModal onContinue={handleComboContinue} />
              )}

              {/* 17. Session Complete (Prompt 2) */}
              {currentMode === 'session_complete' && (
                <SessionCompleteCard
                  onRestart={handleRestartSession}
                  totalQuestions={17}
                  correctCount={correctAnswersCount}
                  xpEarned={135}
                  streakDays={streakCount}
                />
              )}
            </div>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavBar />
    </div>
  );
};

export default Revision;
