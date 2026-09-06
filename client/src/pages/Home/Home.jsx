import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNavBar from '../../components/Navigation/SideNavBar';
import BottomNavBar from '../../components/Navigation/BottomNavBar';
import CreateSubjectModal from '../../components/CreateSubjectModal/CreateSubjectModal';
import SubjectProcessingModal from '../../components/CreateSubjectModal/SubjectProcessingModal';
import SubjectSuccessModal from '../../components/CreateSubjectModal/SubjectSuccessModal';
import SubjectErrorModal from '../../components/CreateSubjectModal/SubjectErrorModal';
import styles from './Home.module.css';

const Home = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);

  // Subject creation modal flow state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isProcessingModalOpen, setIsProcessingModalOpen] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);

  // Simulate subject creation flow
  const handleCreateSubject = (subjectData) => {
    setIsCreateModalOpen(false);
    setIsProcessingModalOpen(true);
    setProcessingStep(0);

    // Simulate AI processing steps
    const stepTimers = [1000, 2000, 3000, 4000, 5000];
    stepTimers.forEach((delay, idx) => {
      setTimeout(() => {
        setProcessingStep(idx);
        // After last step, show success
        if (idx === stepTimers.length - 1) {
          setTimeout(() => {
            setIsProcessingModalOpen(false);
            setIsSuccessModalOpen(true);
            // Add subject to state to switch from new user to active user
            setSubjects(prev => [...prev, {
              id: Date.now(),
              name: subjectData.name,
              description: subjectData.description,
              theme: subjectData.theme,
              progress: 0,
              chapters: 0,
              topics: 0
            }]);
          }, 1500);
        }
      }, delay);
    });
  };

  const handleCancelProcessing = () => {
    setIsProcessingModalOpen(false);
  };

  const handleUploadMaterial = () => {
    setIsSuccessModalOpen(false);
    // Navigate to upload page or open upload modal (future implementation)
    navigate('/syllabus-setup');
  };

  const handleSkipUpload = () => {
    setIsSuccessModalOpen(false);
  };

  const handleRetryCreate = () => {
    setIsErrorModalOpen(false);
    setIsCreateModalOpen(true);
  };

  const handleCancelError = () => {
    setIsErrorModalOpen(false);
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
  }, []);

  const firstName = user?.name ? user.name.split(' ')[0] : 'Alex';

  // Active user state matching Stitch Design reference
  const [subjects, setSubjects] = useState([]);
  
  // To test the New User state (since backend is not connected for subjects yet),
  // we will consider the user new if there are no subjects.
  const isNewUser = subjects.length === 0;

  const metrics = isNewUser ? {
    dailyRevision: { completed: 0, target: 0 },
    streakDays: 0,
    examReadiness: 0, // 'Not calculated' will be handled in render
    smartFocus: 'Pending',
    smartFocusSub: '',
  } : {
    dailyRevision: { completed: 15, target: 20 },
    streakDays: 12,
    examReadiness: 78,
    smartFocus: 'DBMS',
    smartFocusSub: 'High priority',
  };

  const todayRevision = isNewUser ? null : {
    totalQuestions: 15,
    progress: 5,
    target: 20,
    percentage: 25,
  };

  const recommendations = [
    {
      id: 'deadlock',
      tag: 'Needs Work',
      title: 'Deadlock',
      subject: 'Operating Systems',
      accuracy: 42,
      type: 'urgent',
    },
    {
      id: 'scheduling',
      tag: 'Review Suggested',
      title: 'Scheduling',
      subject: 'Operating Systems',
      accuracy: 61,
      type: 'warning',
    },
  ];

  const gamification = isNewUser ? {
    level: 1,
    levelTitle: 'Beginner',
    currentXP: 0,
    nextLevelXP: 100,
    streak: 0,
    percentile: 'Top 100%',
    todayXP: 0,
  } : {
    level: 8,
    levelTitle: 'Knowledge Seeker',
    currentXP: 820,
    nextLevelXP: 1000,
    streak: 12,
    percentile: 'Top 10%',
    todayXP: 125,
  };

  const handleStartRevision = (params = '') => {
    navigate(`/revision${params ? `?${params}` : ''}`);
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Desktop Sidebar Navigation */}
      <SideNavBar
        user={user}
        xpEarned={gamification.currentXP}
        onQuickRevision={() => handleStartRevision('mode=quick')}
      />

      {/* Mobile Top App Bar */}
      <header className={styles.mobileTopBar}>
        <div className={styles.mobileBrand}>
          <span className="material-symbols-outlined" style={{ color: '#4441cc', fontVariationSettings: "'FILL' 1", fontSize: '24px' }}>
            auto_awesome
          </span>
          <span className={styles.mobileBrandTitle}>ReviseAI</span>
        </div>
        <button
          className={styles.mobileProfileBtn}
          onClick={() => navigate('/settings')}
          aria-label="User Profile"
        >
          <span className="material-symbols-outlined" style={{ fontSize: '28px', color: '#464554' }}>
            account_circle
          </span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        <div className={styles.contentInner}>
          {/* Desktop & Mobile Greeting Header */}
          <section className={styles.header}>
            <div>
              <h1 className={styles.greetingTitle}>Good morning, {firstName} 👋</h1>
              <p className={styles.greetingSubtitle}>Ready for today's revision?</p>
            </div>
            <div className={styles.desktopNotificationWrapper}>
              <button
                className={styles.notificationBtn}
                onClick={() => setShowNotifications(!showNotifications)}
                aria-label="Notifications"
                title="Notifications"
              >
                <span className="material-symbols-outlined">notifications</span>
                <span className={styles.notificationBadge}></span>
              </button>

              {showNotifications && (
                <div className={styles.notificationPanel}>
                  <div className={styles.notificationPanelHeader}>
                    <span>Notifications</span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: '#4441cc' }}
                    >
                      Close
                    </button>
                  </div>
                  <div className={styles.notificationItem}>
                    <strong>Daily Target:</strong> 5 more questions to reach your 20 question goal!
                  </div>
                  <div className={styles.notificationItem}>
                    <strong>Streak Alert:</strong> Keep your 12-day streak alive today.
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Top Metrics Row (Responsive 4-col desktop, 2x2 grid mobile) */}
          <section className={styles.metricsGrid}>
            {/* Daily Revision Metric */}
            <div className={styles.metricCard}>
              <div className={styles.metricHeader}>
                <div className={`${styles.metricIconBadge} ${styles.badgeTertiary}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    assignment_turned_in
                  </span>
                </div>
                <h3 className={styles.metricTitle}>Daily Revision</h3>
              </div>
              <div className={styles.metricValueRow}>
                <span className={styles.metricBigVal}>{metrics.dailyRevision.completed}</span>
                <span className={styles.metricSubVal}>/{metrics.dailyRevision.target}</span>
              </div>
            </div>

            {/* Streak Metric */}
            <div className={`${styles.metricCard} ${styles.streakCard}`}>
              <div className={styles.flameWatermark}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  local_fire_department
                </span>
              </div>
              <div className={styles.metricHeader} style={{ position: 'relative', zIndex: 2 }}>
                <div className={`${styles.metricIconBadge} ${styles.badgeSecondary}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", color: '#f97316' }}>
                    local_fire_department
                  </span>
                </div>
                <h3 className={styles.metricTitle} style={{ color: '#f97316' }}>Streak</h3>
              </div>
              <div className={styles.metricValueRow} style={{ position: 'relative', zIndex: 2 }}>
                <span className={styles.metricBigVal}>{metrics.streakDays}</span>
                <span className={styles.metricSubVal}>days</span>
              </div>
            </div>

            {/* Exam Readiness Metric */}
            <div className={styles.metricCard}>
              <div className={styles.cornerAccentPrimary}></div>
              <div className={styles.metricHeader}>
                <div className={`${styles.metricIconBadge} ${styles.badgePrimary}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    trending_up
                  </span>
                </div>
                <h3 className={styles.metricTitle}>Readiness</h3>
              </div>
              <div className={styles.metricValueRow} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                {isNewUser ? (
                  <span className={`${styles.metricBigVal} ${styles.metricBigValTertiary}`} style={{ fontSize: '18px', fontStyle: 'italic', color: '#777586' }}>
                    Not calculated
                  </span>
                ) : (
                  <>
                    <span className={`${styles.metricBigVal} ${styles.metricBigValTertiary}`}>
                      {metrics.examReadiness}%
                    </span>
                    <div className={styles.miniReadinessBarTrack}>
                      <div
                        className={styles.miniReadinessBarFill}
                        style={{ width: `${metrics.examReadiness}%` }}
                      ></div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* AI Smart Focus Metric */}
            <div className={`${styles.metricCard} ${styles.smartFocusCard}`}>
              <div className={styles.brainWatermark}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  psychology
                </span>
              </div>
              <div className={styles.metricHeader} style={{ position: 'relative', zIndex: 2 }}>
                <div className={`${styles.metricIconBadge} ${styles.badgeSecondaryContainer}`}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    psychology
                  </span>
                </div>
                <h3 className={styles.metricTitle} style={{ color: '#4441cc' }}>Smart Focus</h3>
              </div>
              <div className={styles.metricValueRow} style={{ position: 'relative', zIndex: 2, flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                {isNewUser ? (
                  <span className={`${styles.metricBigVal} ${styles.metricBigValFocus}`} style={{ fontSize: '18px', fontStyle: 'italic', color: '#777586' }}>
                    Pending
                  </span>
                ) : (
                  <>
                    <span className={`${styles.metricBigVal} ${styles.metricBigValFocus}`}>
                      {metrics.smartFocus}
                    </span>
                    <span className={styles.smartFocusSub}>{metrics.smartFocusSub}</span>
                  </>
                )}
              </div>
            </div>
          </section>

          {/* Main Layout Grid */}
          {isNewUser ? (
            <section className={styles.emptyStateHero}>
              <div className={styles.emptyStateIconContainer}>
                <div className={styles.emptyStateIconBox}>
                  <span className="material-symbols-outlined" style={{ fontSize: '64px', color: 'rgba(68, 65, 204, 0.4)' }}>
                    auto_stories
                  </span>
                </div>
                <div className={styles.emptyStateGlowPrimary}></div>
                <div className={styles.emptyStateGlowSecondary}></div>
              </div>
              <h3 className={styles.emptyStateTitle}>No subjects yet</h3>
              <p className={styles.emptyStateDesc}>
                Create your first subject and let ReviseAI build your personalized revision journey.
              </p>
              <div className={styles.emptyStateActions}>
                <button 
                  className={styles.emptyStateCreateBtn}
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
                  Create Your First Subject
                </button>
                <button 
                  className={styles.emptyStateLoadBtn}
                  onClick={() => navigate('/syllabus-setup')}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>download</span>
                  Load Subjects
                </button>
              </div>
            </section>
          ) : (
            <div className={styles.mainGrid}>
              {/* Left Column: Primary Content */}
              <div className={styles.leftColumn}>
                {/* Today's Revision Card */}
                <section>
                  <div className={styles.revisionHeroCard}>
                    <div className={styles.sparkleIcon}>
                      <span className="material-symbols-outlined">auto_awesome</span>
                    </div>
                    <div className={styles.heroContentFlex}>
                      <div className={styles.heroLeftText}>
                        <div className={styles.aiBadge}>
                          <span className="material-symbols-outlined">auto_awesome</span>
                          <span>AI Curated</span>
                        </div>
                        <h2 className={styles.heroHeadline}>
                          {todayRevision?.totalQuestions || 0} questions are waiting for you
                        </h2>
                        <p className={styles.heroSubtitle}>
                          Based on your recent performance, we've curated a mix of new topics and weak areas.
                        </p>
                        <div className={styles.progressLabelRow}>
                          <span>Today's Progress</span>
                          <span style={{ color: '#4441cc', fontWeight: 700 }}>
                            {todayRevision?.progress || 0}/{todayRevision?.target || 0}
                          </span>
                        </div>
                        <div className={styles.progressBarTrack}>
                          <div
                            className={styles.progressBarFill}
                            style={{ width: `${todayRevision?.percentage || 0}%` }}
                          >
                            <div className={styles.progressBarPulse}></div>
                          </div>
                        </div>
                      </div>
                      <button
                        className={styles.startRevisionBtn}
                        onClick={() => handleStartRevision()}
                      >
                        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}>
                          play_arrow
                        </span>
                        <span>START REVISION</span>
                      </button>
                    </div>
                  </div>
                </section>

                {/* Your Subjects Section */}
                <section className={styles.subjectsSection}>
                  <h3 className={styles.sectionHeading}>Your Subjects</h3>
                  <div className={styles.subjectsContainer}>
                    {subjects.map((subject) => (
                      <div key={subject.id} className={styles.subjectCard}>
                        <div className={styles.subjectHeader}>
                          <div
                            className={styles.subjectIconBox}
                            style={{
                              backgroundColor:
                                subject.id === 'dbms'
                                  ? '#e2dfff'
                                  : subject.id === 'cn'
                                  ? '#cb66fe'
                                  : '#00789a',
                              color:
                                subject.id === 'dbms'
                                  ? '#4441cc'
                                  : subject.id === 'cn'
                                  ? '#4a006b'
                                  : '#ffffff',
                            }}
                          >
                            <span className="material-symbols-outlined">{subject.icon}</span>
                          </div>
                          <span
                            className={styles.subjectMasteryBadge}
                            style={{
                              backgroundColor: subject.badgeBg,
                              color: subject.badgeColor,
                            }}
                          >
                            {subject.mastery}%
                          </span>
                        </div>
                        <div className={styles.subjectContent}>
                          <h4 className={styles.subjectName}>{subject.name}</h4>
                          <p className={styles.subjectTopicInfo}>
                            {subject.topicsNeedingReview > 0
                              ? `${subject.topicsNeedingReview} Topics needing review`
                              : 'Mastered'}
                          </p>
                        </div>
                        <button
                          className={subject.status === 'mastered' ? styles.reviewSubjectBtn : styles.continueBtn}
                          onClick={() => handleStartRevision(`subject=${encodeURIComponent(subject.name)}`)}
                        >
                          {subject.status === 'mastered' ? 'REVIEW' : 'CONTINUE'}
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              {/* Right Column: Secondary Content */}
              <div className={styles.rightColumn}>
                {/* AI Recommendations */}
                <section>
                  <h3 className={styles.sectionHeading} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    Recommended for You
                    <span className="material-symbols-outlined" style={{ color: '#9026c3', fontVariationSettings: "'FILL' 1", fontSize: '20px' }}>
                      auto_awesome
                    </span>
                  </h3>
                  <div className={styles.recommendationsCard}>
                    {recommendations.map((rec) => (
                      <div
                        key={rec.id}
                        className={rec.type === 'urgent' ? styles.recommendationItemRed : styles.recommendationItemYellow}
                        onClick={() => handleStartRevision(`topic=${encodeURIComponent(rec.title)}`)}
                      >
                        <div className={styles.recTopRow}>
                          <div>
                            <span className={rec.type === 'urgent' ? styles.recTagRed : styles.recTagYellow}>
                              {rec.tag}
                            </span>
                            <h4 className={styles.recTitle}>{rec.title}</h4>
                          </div>
                          <div className={rec.type === 'urgent' ? styles.recAccuracyBadgeRed : styles.recAccuracyBadgeYellow}>
                            {rec.accuracy}% Acc.
                          </div>
                        </div>
                        <p className={styles.recSubject}>{rec.subject}</p>
                        <button
                          className={styles.reviewTopicBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartRevision(`topic=${encodeURIComponent(rec.title)}`);
                          }}
                        >
                          <span>Review Topic</span>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                            arrow_forward
                          </span>
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Gamification Widget (Your Progress) */}
                <section>
                  <h3 className={styles.sectionHeading}>Your Progress</h3>
                  <div className={styles.progressCard}>
                    <div className={styles.levelRow}>
                      <div className={styles.levelAvatar}>
                        {gamification.level}
                      </div>
                      <div>
                        <h4 className={styles.levelLabel}>Current Level</h4>
                        <p className={styles.levelTitle}>{gamification.levelTitle}</p>
                      </div>
                    </div>
                    <div className={styles.xpSection}>
                      <div className={styles.progressLabelRow}>
                        <span>XP Progress</span>
                        <span style={{ fontWeight: 700, color: '#4441cc' }}>
                          {gamification.currentXP} / {gamification.nextLevelXP}
                        </span>
                      </div>
                      <div className={styles.progressBarTrack}>
                        <div
                          className={styles.xpProgressFill}
                          style={{ width: `${(gamification.currentXP / gamification.nextLevelXP) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className={styles.statsRow}>
                      <div className={styles.statItem}>
                        <div className={styles.statIconBadgeOrange}>
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                            local_fire_department
                          </span>
                        </div>
                        <span className={styles.statLabel}>{gamification.streak} Day Streak</span>
                      </div>
                      <div className={styles.statItem}>
                        <div className={styles.statIconBadgePurple}>
                          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                            workspace_premium
                          </span>
                        </div>
                        <span className={styles.statLabel}>{gamification.percentile}</span>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Floating XP Earned Indicator */}
      <div className={styles.mobileFloatingXP}>
        <span className="material-symbols-outlined" style={{ color: '#ffc107', fontVariationSettings: "'FILL' 1", fontSize: '18px' }}>
          stars
        </span>
        <span className={styles.mobileFloatingXPText}>
          <strong style={{ color: '#ffb300' }}>+{gamification.todayXP}</strong> XP Today
        </span>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavBar />

      {/* Subject Creation Modal Flow */}
      <CreateSubjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubject}
      />
      <SubjectProcessingModal
        isOpen={isProcessingModalOpen}
        onCancel={handleCancelProcessing}
        currentStep={processingStep}
      />
      <SubjectSuccessModal
        isOpen={isSuccessModalOpen}
        onUploadMaterial={handleUploadMaterial}
        onSkip={handleSkipUpload}
      />
      <SubjectErrorModal
        isOpen={isErrorModalOpen}
        onRetry={handleRetryCreate}
        onCancel={handleCancelError}
      />
    </div>
  );
};

export default Home;
