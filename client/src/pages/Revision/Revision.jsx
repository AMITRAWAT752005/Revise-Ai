import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SideNavBar from '../../components/Navigation/SideNavBar';
import BottomNavBar from '../../components/Navigation/BottomNavBar';
import QuickPickCard from './components/QuickPickCard';
import FillTheGapCard from './components/FillTheGapCard';
import FlashcardCard from './components/FlashcardCard';
import ShortAnswerCard from './components/ShortAnswerCard';
import ShortAnswerEvaluation from './components/ShortAnswerEvaluation';
import CorrectFeedbackModal from './components/CorrectFeedbackModal';
import WrongFeedbackModal from './components/WrongFeedbackModal';
import ComboRewardModal from './components/ComboRewardModal';
import styles from './Revision.module.css';

const STITCH_MODES = [
  { id: 'quick_pick', label: '1. Quick Pick' },
  { id: 'fill_gap', label: '2. Fill Gap' },
  { id: 'flashcard_front', label: '3. Flashcard Front' },
  { id: 'flashcard_back', label: '4. Flashcard Back' },
  { id: 'short_answer', label: '5. Short Answer' },
  { id: 'evaluation', label: '6. AI Evaluation' },
  { id: 'correct_feedback', label: '7. Correct Feedback' },
  { id: 'wrong_feedback', label: '8. Wrong Feedback' },
  { id: 'combo_reward', label: '9. Combo Reward' }
];

const Revision = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [currentMode, setCurrentMode] = useState('quick_pick');
  const [interactiveStep, setInteractiveStep] = useState(1);
  const [userAnswer, setUserAnswer] = useState('');
  const [totalXpEarned, setTotalXpEarned] = useState(820);
  const [streakCount, setStreakCount] = useState(5);

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
    setInteractiveStep(1);
  };

  const handleMaybeLater = () => {
    navigate('/home');
  };

  const handleSelectMode = (modeId) => {
    setCurrentMode(modeId);
    setSessionActive(true);
    setSearchParams({ mode: modeId });
  };

  // Flow handlers
  const handleQuickPickOption = (option) => {
    if (option.isCorrect) {
      setTotalXpEarned((prev) => prev + 10);
      setCurrentMode('correct_feedback');
    } else {
      setCurrentMode('wrong_feedback');
    }
  };

  const handleFillGapContinue = (isCorrect) => {
    if (isCorrect) {
      setTotalXpEarned((prev) => prev + 15);
    }
    setCurrentMode('flashcard_front');
  };

  const handleFlashcardRate = (rating) => {
    const xpBonus = rating === 'easy' ? 15 : rating === 'good' ? 10 : 5;
    setTotalXpEarned((prev) => prev + xpBonus);
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
    setCurrentMode('quick_pick');
    setInteractiveStep(1);
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

        {/* Content Area */}
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
                  10 minutes is all it takes to make it stick. Try to complete the
                  full series or stay focused for at least 10 minutes.
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
            /* ACTIVE STITCH REVISION SCREENS                       */
            /* ==================================================== */
            <div className={styles.screenRenderer}>
              {currentMode === 'quick_pick' && (
                <QuickPickCard
                  onSelectOption={handleQuickPickOption}
                  onBack={() => setSessionActive(false)}
                />
              )}

              {currentMode === 'fill_gap' && (
                <FillTheGapCard
                  onContinue={handleFillGapContinue}
                  onBack={() => setCurrentMode('quick_pick')}
                />
              )}

              {currentMode === 'flashcard_front' && (
                <FlashcardCard
                  initialFlipped={false}
                  onRate={handleFlashcardRate}
                  onBack={() => setCurrentMode('fill_gap')}
                />
              )}

              {currentMode === 'flashcard_back' && (
                <FlashcardCard
                  initialFlipped={true}
                  onRate={handleFlashcardRate}
                  onBack={() => setCurrentMode('flashcard_front')}
                />
              )}

              {currentMode === 'short_answer' && (
                <ShortAnswerCard
                  onSubmit={handleShortAnswerSubmit}
                  onBack={() => setCurrentMode('flashcard_front')}
                />
              )}

              {currentMode === 'evaluation' && (
                <ShortAnswerEvaluation
                  data={{
                    questionIndex: 4,
                    totalQuestions: 10,
                    question: 'What is the difference between TCP and UDP?',
                    userAnswer:
                      userAnswer ||
                      'TCP is connection-oriented and provides reliable, ordered data delivery with error checking. UDP is connectionless and faster without delivery guarantees.',
                    score: 8,
                    maxScore: 10,
                    xpEarned: 20,
                    headline: 'Solid Understanding!',
                    summary:
                      "You've grasped the core distinction between reliability and speed effectively.",
                    criteria: [
                      {
                        title: 'Connection Type Distinction',
                        description:
                          'Accurately identified TCP as connection-oriented and UDP as connectionless.',
                        passed: true
                      },
                      {
                        title: 'Reliability & Overhead',
                        description:
                          'Correctly explained delivery guarantees and performance trade-offs.',
                        passed: true
                      }
                    ],
                    quickTip:
                      'For full marks, mention specific protocol examples like HTTP/HTTPS using TCP and DNS/Streaming using UDP.'
                  }}
                  onNext={handleEvaluationNext}
                  onReport={() => alert('Issue reported for review.')}
                  onBack={() => setCurrentMode('short_answer')}
                />
              )}

              {currentMode === 'correct_feedback' && (
                <CorrectFeedbackModal
                  onNext={() => setCurrentMode('fill_gap')}
                  onAgain={() => setCurrentMode('quick_pick')}
                />
              )}

              {currentMode === 'wrong_feedback' && (
                <WrongFeedbackModal
                  onGotIt={() => setCurrentMode('fill_gap')}
                  onTryAgain={() => setCurrentMode('quick_pick')}
                  onBack={() => setCurrentMode('quick_pick')}
                />
              )}

              {currentMode === 'combo_reward' && (
                <ComboRewardModal onContinue={handleComboContinue} />
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
