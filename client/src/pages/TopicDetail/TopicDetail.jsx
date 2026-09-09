import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SideNavBar from '../../components/Navigation/SideNavBar';
import BottomNavBar from '../../components/Navigation/BottomNavBar';
import styles from './TopicDetail.module.css';

/**
 * TopicDetail Page handles:
 * - Task 15: Topic Detail: 3NF
 * - Task 16: Mobile Views
 * - Task 24: Dynamic Data Integration
 */
const TopicDetail = () => {
  const { subjectId, unitId, topicId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [topicData, setTopicData] = useState(null);
  const [unitData, setUnitData] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTopicAndContext = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!topicId) {
        throw new Error('No topic ID provided');
      }

      // 1. Fetch Topic Details
      const topicRes = await fetch(`/api/topics/${topicId}`, { credentials: 'include' });
      const topicJson = await topicRes.json();

      if (!topicRes.ok || !topicJson.success || !topicJson.data) {
        throw new Error(topicJson.message || topicJson.error || 'Topic not found');
      }

      setTopicData(topicJson.data);

      // 2. Fetch Unit Details (for parent unit name and breadcrumb)
      const targetUnitId = unitId || topicJson.data.unitId;
      let fetchedUnit = null;
      if (targetUnitId) {
        try {
          const unitRes = await fetch(`/api/units/${targetUnitId}`, { credentials: 'include' });
          const unitJson = await unitRes.json();
          if (unitRes.ok && unitJson.success && unitJson.data) {
            fetchedUnit = unitJson.data;
            setUnitData(unitJson.data);
          }
        } catch (unitErr) {
          console.warn('Could not fetch unit for topic breadcrumbs:', unitErr);
        }
      }

      // 3. Fetch Subject Details (for subject name and breadcrumb)
      const targetSubjectId = subjectId || fetchedUnit?.subjectId;
      if (targetSubjectId) {
        try {
          const subRes = await fetch(`/api/subjects/${targetSubjectId}`, { credentials: 'include' });
          const subJson = await subRes.json();
          if (subRes.ok && subJson.success && subJson.subject) {
            setSubjectData(subJson.subject);
          }
        } catch (subErr) {
          console.warn('Could not fetch subject for topic breadcrumbs:', subErr);
        }
      }
    } catch (err) {
      console.error('Error loading topic details:', err);
      setError(err.message || 'Unable to load topic details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }

    fetchTopicAndContext();
  }, [topicId, unitId, subjectId]);

  const effectiveSubjectId = subjectId || unitData?.subjectId || '';
  const effectiveUnitId = unitId || topicData?.unitId || '';
  const subjectName = subjectData?.name || 'Subject';
  const unitName = unitData?.name || 'Unit';
  const topicName = topicData?.name || 'Topic Detail';

  const handleStartRevision = () => {
    navigate(`/revision?topic=${encodeURIComponent(topicName)}`);
  };

  const handleViewNotes = () => {
    alert(`Opening related study notes for ${topicName}...`);
  };

  const handlePracticePYQs = () => {
    navigate(`/revision?topic=${encodeURIComponent(topicName)}&mode=pyq`);
  };

  // Dynamic formatting
  const topicMastery = topicData?.mastery ?? 0;
  const questionsDue =
    topicData?.status === 'completed' || topicMastery >= 85
      ? 1
      : topicMastery >= 60
      ? 3
      : 5;

  const formattedLastRevised = topicData?.updatedAt
    ? new Date(topicData.updatedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recently';

  const encouragementText =
    topicMastery >= 85
      ? 'Mastered! Excellent retention.'
      : topicMastery >= 60
      ? 'Almost mastered! Keep going.'
      : 'Ready for active practice!';

  return (
    <div className={styles.topicLayout}>
      {/* Side Navigation */}
      <SideNavBar user={user} xpEarned={user?.progress?.xp || user?.xp || 0} onQuickRevision={() => navigate('/revision')} />

      {/* Mobile Top App Bar */}
      <header className={styles.mobileTopBar}>
        <div
          className={styles.mobileBrand}
          onClick={() => {
            if (effectiveSubjectId && effectiveUnitId) {
              navigate(`/subjects/${effectiveSubjectId}/units/${effectiveUnitId}`);
            } else if (effectiveSubjectId) {
              navigate(`/subjects/${effectiveSubjectId}`);
            } else {
              navigate('/subjects');
            }
          }}
        >
          <span className="material-symbols-outlined" style={{ color: '#4441cc', fontSize: '24px' }}>
            arrow_back
          </span>
          <span className={styles.mobileBrandTitle}>{topicName}</span>
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

      {/* Main Container */}
      <main className={styles.mainContainer}>
        {/* Desktop Top Header */}
        <header className={styles.topHeader}>
          <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
            <Link to="/subjects" className={styles.breadcrumbLink}>
              Subjects
            </Link>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              chevron_right
            </span>
            {effectiveSubjectId ? (
              <Link to={`/subjects/${effectiveSubjectId}`} className={styles.breadcrumbLink}>
                {subjectName}
              </Link>
            ) : (
              <span className={styles.breadcrumbLink}>{subjectName}</span>
            )}
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              chevron_right
            </span>
            {effectiveSubjectId && effectiveUnitId ? (
              <Link
                to={`/subjects/${effectiveSubjectId}/units/${effectiveUnitId}`}
                className={styles.breadcrumbLink}
              >
                {unitName}
              </Link>
            ) : (
              <span className={styles.breadcrumbLink}>{unitName}</span>
            )}
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              chevron_right
            </span>
            <span className={styles.breadcrumbCurrent}>{topicName}</span>
          </nav>
          <div className={styles.headerActions}>
            <button className={styles.iconBtn} aria-label="Notifications" title="Notifications">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <div className={styles.userAvatar}>
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
          </div>
        </header>

        <div className={styles.contentWrapper}>
          {/* Loading State */}
          {loading && (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Loading topic details...</p>
            </div>
          )}

          {/* Error / Not Found State */}
          {error && !loading && (
            <div className={styles.errorContainer}>
              <span className="material-symbols-outlined" style={{ fontSize: '56px', color: '#ba1a1a' }}>
                cloud_off
              </span>
              <h2 className={styles.errorTitle}>Topic Not Found</h2>
              <p className={styles.errorMessage}>{error}</p>
              <div className={styles.errorActionGroup}>
                <button className={styles.retryBtn} onClick={fetchTopicAndContext}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    refresh
                  </span>
                  <span>Retry</span>
                </button>
                <button
                  className={styles.backBtn}
                  onClick={() => {
                    if (effectiveSubjectId && effectiveUnitId) {
                      navigate(`/subjects/${effectiveSubjectId}/units/${effectiveUnitId}`);
                    } else {
                      navigate('/subjects');
                    }
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    arrow_back
                  </span>
                  <span>Back to Unit</span>
                </button>
              </div>
            </div>
          )}

          {/* Topic Loaded State */}
          {!loading && !error && topicData && (
            <>
              {/* Header Section */}
              <section className={styles.topicHeaderSection}>
                <h1 className={styles.topicMainTitle}>{topicData.name}</h1>
                <div className={styles.topicTagsRow}>
                  <div className={styles.lastRevisedTag}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#005e79' }}>
                      calendar_clock
                    </span>
                    <span>Last Revised {formattedLastRevised}</span>
                  </div>
                  <div className={styles.revisionDueTag}>
                    <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                      assignment_late
                    </span>
                    <span>Revision Due: {questionsDue} Questions</span>
                  </div>
                </div>
              </section>

              {/* Main 2-Column Content Grid */}
              <section className={styles.topicContentGrid}>
                {/* Left Column: AI Overview & CTA */}
                <div className={styles.leftColumn}>
                  {/* AI Overview Card */}
                  <div className={styles.aiOverviewCard}>
                    <div className={styles.aiOverviewIconBox}>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        auto_awesome
                      </span>
                    </div>
                    <div>
                      <h3 className={styles.aiOverviewHeading}>Quick Overview</h3>
                      <p className={styles.aiOverviewBody}>
                        {topicData.description ||
                          `Comprehensive notes, core concepts, and key principles for ${topicData.name} in unit ${unitName}.`}
                      </p>
                    </div>
                  </div>

                  {/* CTA Area Card */}
                  <div className={styles.ctaAreaCard}>
                    <div className={styles.ctaBrainIcon}>
                      <span className="material-symbols-outlined">psychology</span>
                    </div>
                    <h3 className={styles.ctaHeading}>Ready to master {topicData.name}?</h3>
                    <p className={styles.ctaSubtitle}>
                      Tackle the {questionsDue} due questions to improve your retention and clear your revision queue.
                    </p>
                    <div className={styles.ctaButtonsGroup}>
                      <button
                        className={styles.ctaStartRevisionBtn}
                        onClick={handleStartRevision}
                      >
                        <span>Start Revision</span>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          arrow_forward
                        </span>
                      </button>
                      <button className={styles.ctaSecondaryBtn} onClick={handleViewNotes}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          description
                        </span>
                        <span>View Related Notes</span>
                      </button>
                      <button className={styles.ctaSecondaryBtn} onClick={handlePracticePYQs}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          history_edu
                        </span>
                        <span>Practice PYQs</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Column: Progress Card */}
                <div className={styles.rightColumn}>
                  <div className={styles.progressCard}>
                    <div className={styles.progressCardHeader}>
                      <span className={styles.progressLabel}>Your Progress</span>
                      <span
                        className="material-symbols-outlined"
                        style={{ color: '#5e5ce6', fontVariationSettings: "'FILL' 1" }}
                      >
                        trending_up
                      </span>
                    </div>

                    <div className={styles.masteryBigRow}>
                      <span className={styles.masteryBigNumber}>{topicMastery}</span>
                      <span className={styles.masteryPercent}>%</span>
                      <span className={styles.masteryWord}>Mastery</span>
                    </div>

                    <div className={styles.progressTrackWide}>
                      <div
                        className={styles.progressFillGradient}
                        style={{ width: `${topicMastery}%` }}
                      ></div>
                    </div>

                    <p className={styles.progressEncouragement}>{encouragementText}</p>
                  </div>
                </div>
              </section>
            </>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavBar />
    </div>
  );
};

export default TopicDetail;
