import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SideNavBar from '../../components/Navigation/SideNavBar';
import BottomNavBar from '../../components/Navigation/BottomNavBar';
import styles from './UnitDetail.module.css';

/**
 * UnitDetail Page handles:
 * - Task 14: Unit Detail: Normalization
 * - Task 16: Mobile Views
 * - Task 24: Dynamic Data Integration
 */
const UnitDetail = () => {
  const { subjectId, unitId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [unitData, setUnitData] = useState(null);
  const [subjectData, setSubjectData] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUnitDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!unitId) {
        throw new Error('No unit ID provided');
      }

      // 1. Fetch Unit
      const unitRes = await fetch(`/api/units/${unitId}`, { credentials: 'include' });
      const unitJson = await unitRes.json();

      if (!unitRes.ok || !unitJson.success || !unitJson.data) {
        throw new Error(unitJson.message || unitJson.error || 'Unit not found');
      }

      setUnitData(unitJson.data);

      // 2. Fetch Subject details (for breadcrumbs and context)
      const targetSubjectId = subjectId || unitJson.data.subjectId;
      if (targetSubjectId) {
        try {
          const subRes = await fetch(`/api/subjects/${targetSubjectId}`, { credentials: 'include' });
          const subJson = await subRes.json();
          if (subRes.ok && subJson.success && subJson.subject) {
            setSubjectData(subJson.subject);
          }
        } catch (subErr) {
          console.warn('Could not fetch subject for unit breadcrumbs:', subErr);
        }
      }

      // 3. Fetch Topics for Unit
      try {
        const topicsRes = await fetch(`/api/units/${unitId}/topics`, { credentials: 'include' });
        const topicsJson = await topicsRes.json();
        if (topicsRes.ok && topicsJson.success && Array.isArray(topicsJson.data)) {
          setTopics(topicsJson.data);
        } else {
          setTopics([]);
        }
      } catch (topicsErr) {
        console.warn('Could not fetch topics for unit:', topicsErr);
        setTopics([]);
      }
    } catch (err) {
      console.error('Error loading unit details:', err);
      setError(err.message || 'Unable to load unit details');
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

    fetchUnitDetails();
  }, [unitId, subjectId]);

  const subjectName = subjectData?.name || 'Subject';
  const effectiveSubjectId = subjectId || unitData?.subjectId || '';

  const handleStartUnitRevision = () => {
    navigate(`/revision?unit=${encodeURIComponent(unitData?.name || 'Unit')}`);
  };

  const handleDownloadNotes = () => {
    alert(`Downloading study notes for ${unitData?.name || 'Unit'}...`);
  };

  const getTopicMeta = (topic) => {
    const mastery = topic.mastery || 0;
    const isCompleted = topic.status === 'completed';

    if (isCompleted || mastery >= 85) {
      return {
        status: 'strong',
        badge: 'Strong',
        fillColor: '#ffcc00',
        icon: 'star',
      };
    }
    if (mastery >= 70) {
      return {
        status: 'good',
        badge: 'Good',
        fillColor: '#2a22b5',
        icon: 'check_circle',
      };
    }
    if (mastery >= 40 || topic.status === 'in_progress') {
      return {
        status: 'progress',
        badge: 'In Progress',
        fillColor: '#5e5ce6',
        icon: 'trending_up',
      };
    }
    if (mastery > 0) {
      return {
        status: 'attention',
        badge: 'Needs Attention',
        fillColor: '#ba1a1a',
        icon: 'warning',
      };
    }
    return {
      status: 'started',
      badge: 'Just Started',
      fillColor: '#8cd0ef',
      icon: 'start',
    };
  };

  const getBadgeElement = (meta) => {
    switch (meta.status) {
      case 'strong':
        return (
          <span className={styles.badgeStrong}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              star
            </span>
            {meta.badge}
          </span>
        );
      case 'good':
        return (
          <span className={styles.badgeGood}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              check_circle
            </span>
            {meta.badge}
          </span>
        );
      case 'attention':
        return (
          <span className={styles.badgeAttention}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              warning
            </span>
            {meta.badge}
          </span>
        );
      case 'started':
        return (
          <span className={styles.badgeStarted}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              start
            </span>
            {meta.badge}
          </span>
        );
      default:
        return (
          <span className={styles.badgeProgress}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              trending_up
            </span>
            {meta.badge}
          </span>
        );
    }
  };

  // Dynamic statistics
  const unitMastery = unitData?.mastery ?? 0;
  const topicsCount = topics.length > 0 ? topics.length : (unitData?.totalTopics ?? 0);
  const revisionDueCount = topics.filter(
    (t) => (t.mastery || 0) < 70 || t.status !== 'completed'
  ).length;

  return (
    <div className={styles.unitLayout}>
      {/* Side Navigation */}
      <SideNavBar user={user} xpEarned={user?.progress?.xp || user?.xp || 0} onQuickRevision={() => navigate('/revision')} />

      {/* Mobile Top App Bar */}
      <header className={styles.mobileTopBar}>
        <div
          className={styles.mobileBrand}
          onClick={() => navigate(effectiveSubjectId ? `/subjects/${effectiveSubjectId}` : '/subjects')}
        >
          <span className="material-symbols-outlined" style={{ color: '#4441cc', fontSize: '24px' }}>
            arrow_back
          </span>
          <span className={styles.mobileBrandTitle}>{unitData?.name || 'Unit Detail'}</span>
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
        {/* Desktop Header */}
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
            <span className={styles.breadcrumbCurrent}>{unitData?.name || 'Unit'}</span>
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
              <p className={styles.loadingText}>Loading unit details...</p>
            </div>
          )}

          {/* Error / Not Found State */}
          {error && !loading && (
            <div className={styles.errorContainer}>
              <span className="material-symbols-outlined" style={{ fontSize: '56px', color: '#ba1a1a' }}>
                cloud_off
              </span>
              <h2 className={styles.errorTitle}>Unit Not Found</h2>
              <p className={styles.errorMessage}>{error}</p>
              <div className={styles.errorActionGroup}>
                <button className={styles.retryBtn} onClick={fetchUnitDetails}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    refresh
                  </span>
                  <span>Retry</span>
                </button>
                <button
                  className={styles.backBtn}
                  onClick={() =>
                    navigate(effectiveSubjectId ? `/subjects/${effectiveSubjectId}` : '/subjects')
                  }
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    arrow_back
                  </span>
                  <span>Back to Workspace</span>
                </button>
              </div>
            </div>
          )}

          {/* Unit Loaded State */}
          {!loading && !error && unitData && (
            <>
              {/* Unit Header Bento Grid */}
              <section className={styles.unitBentoGrid}>
                {/* Main Title & CTA Card */}
                <div className={styles.unitHeroCard}>
                  <div>
                    <div className={styles.unitTagPill}>
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                        folder_open
                      </span>
                      <span>Unit {unitData.order ?? 1}</span>
                    </div>
                    <h1 className={styles.unitTitle}>{unitData.name}</h1>
                    <p className={styles.unitDesc}>
                      {unitData.description ||
                        `Master the key concepts, definitions, and active recall questions for ${unitData.name}.`}
                    </p>
                  </div>
                  <div className={styles.unitHeroActions}>
                    <button
                      className={styles.startUnitRevisionBtn}
                      onClick={handleStartUnitRevision}
                    >
                      <span>Start Unit Revision</span>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        arrow_forward
                      </span>
                    </button>
                    <button className={styles.downloadNotesBtn} onClick={handleDownloadNotes}>
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        download
                      </span>
                      <span>Download Notes</span>
                    </button>
                  </div>
                </div>

                {/* Stats Vertical Stack */}
                <div className={styles.statsStack}>
                  {/* Mastery Gauge */}
                  <div className={styles.masteryCard}>
                    <div className={styles.masteryCardHeader}>
                      <span className={styles.masteryLabel}>Unit Mastery</span>
                      <span
                        className="material-symbols-outlined"
                        style={{ color: '#2a22b5', fontVariationSettings: "'FILL' 1" }}
                      >
                        auto_awesome
                      </span>
                    </div>
                    <div className={styles.masteryNumber}>{unitMastery}%</div>
                    <div className={styles.sparkTrack}>
                      <div
                        className={styles.sparkFill}
                        style={{ width: `${unitMastery}%` }}
                      ></div>
                    </div>
                    <p className={styles.masterySubNote}>
                      {Math.max(0, 100 - unitMastery)}% remaining to mastery
                    </p>
                  </div>

                  {/* Meta Stats 2-Grid */}
                  <div className={styles.metaStatsGrid}>
                    <div className={styles.metaCard}>
                      <span className="material-symbols-outlined" style={{ color: '#464554' }}>
                        view_list
                      </span>
                      <span className={styles.metaCardVal}>{topicsCount}</span>
                      <span className={styles.metaCardLabel}>Topics</span>
                    </div>
                    <div
                      className={`${styles.metaCard} ${revisionDueCount > 0 ? styles.metaCardError : ''}`}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ color: revisionDueCount > 0 ? '#ba1a1a' : '#2a22b5' }}
                      >
                        schedule
                      </span>
                      <span
                        className={`${styles.metaCardVal} ${revisionDueCount > 0 ? styles.metaCardValError : ''}`}
                      >
                        {revisionDueCount}
                      </span>
                      <span
                        className={styles.metaCardLabel}
                        style={{ color: revisionDueCount > 0 ? '#ba1a1a' : '#464554' }}
                      >
                        Revision Due
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Topics Bento Grid Section */}
              <section>
                <div className={styles.topicsSectionHeader}>
                  <h2 className={styles.topicsSectionTitle}>Topics in this Unit</h2>
                </div>

                <div className={styles.topicsGrid}>
                  {topics.length === 0 ? (
                    <div className={styles.emptyTopicsCard}>
                      <span className={`material-symbols-outlined ${styles.emptyTopicsIcon}`}>
                        topic
                      </span>
                      <h3 className={styles.emptyTopicsTitle}>No topics in this unit</h3>
                      <p className={styles.emptyTopicsSubtitle}>
                        Topics extracted from your syllabus or created for this unit will appear here.
                      </p>
                    </div>
                  ) : (
                    topics.map((topic) => {
                      const meta = getTopicMeta(topic);
                      const isAttention = meta.status === 'attention';
                      const topicMastery = topic.mastery || 0;

                      return (
                        <div
                          key={topic._id}
                          className={`${styles.topicCard} ${isAttention ? styles.topicCardAttention : ''}`}
                        >
                          <div>
                            <div className={styles.topicTopRow}>
                              {getBadgeElement(meta)}
                              <span
                                className={`${styles.topicMasteryNumber} ${isAttention ? styles.topicMasteryNumberError : ''}`}
                              >
                                {topicMastery}%
                              </span>
                            </div>
                            <h3 className={styles.topicCardTitle}>{topic.name}</h3>
                            <p className={styles.topicCardDesc}>
                              {topic.description ||
                                `Essential concepts, formulas, and revision materials for ${topic.name}.`}
                            </p>
                          </div>

                          <div>
                            <div className={styles.topicCardProgressTrack}>
                              <div
                                className={styles.topicCardProgressFill}
                                style={{
                                  width: `${topicMastery}%`,
                                  backgroundColor: meta.fillColor,
                                }}
                              ></div>
                            </div>
                            <button
                              className={`${styles.reviewTopicBtn} ${isAttention ? styles.reviewTopicBtnAttention : ''}`}
                              onClick={() => {
                                navigate(
                                  `/subjects/${effectiveSubjectId}/units/${unitId}/topics/${topic._id}`
                                );
                              }}
                            >
                              <span>Review Topic</span>
                              <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                                arrow_forward
                              </span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
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

export default UnitDetail;
