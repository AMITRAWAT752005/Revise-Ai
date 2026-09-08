import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SideNavBar from '../../components/Navigation/SideNavBar';
import BottomNavBar from '../../components/Navigation/BottomNavBar';
import styles from './TopicDetail.module.css';

/**
 * TopicDetail Page handles:
 * - Task 15: Topic Detail: 3NF
 * - Task 16: Mobile Views
 */
const TopicDetail = () => {
  const {
    subjectId = 'dbms',
    unitId = 'normalization',
    topicId = '3nf',
  } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }
  }, []);

  const topicData = {
    title: 'Third Normal Form (3NF)',
    subjectName: 'DBMS',
    unitName: 'Normalization',
    lastRevised: '3 days ago',
    questionsDue: 5,
    mastery: 42,
    overview:
      '3NF removes transitive dependencies by ensuring that non-key attributes depend only on the primary key.',
    ctaSubtitle:
      'Tackle the 5 due questions to improve your retention and clear your revision queue.',
  };

  const handleStartRevision = () => {
    navigate(`/revision?topic=${encodeURIComponent('Third Normal Form (3NF)')}`);
  };

  const handleViewNotes = () => {
    alert('Opening related notes for 3NF...');
  };

  const handlePracticePYQs = () => {
    navigate(`/revision?topic=${encodeURIComponent('3NF')}&mode=pyq`);
  };

  return (
    <div className={styles.topicLayout}>
      {/* Side Navigation */}
      <SideNavBar user={user} xpEarned={820} onQuickRevision={() => navigate('/revision')} />

      {/* Mobile Top App Bar */}
      <header className={styles.mobileTopBar}>
        <div
          className={styles.mobileBrand}
          onClick={() => navigate(`/subjects/${subjectId}/units/${unitId}`)}
        >
          <span className="material-symbols-outlined" style={{ color: '#4441cc', fontSize: '24px' }}>
            arrow_back
          </span>
          <span className={styles.mobileBrandTitle}>3NF</span>
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
            <Link to={`/subjects/${subjectId}`} className={styles.breadcrumbLink}>
              DBMS
            </Link>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              chevron_right
            </span>
            <Link to={`/subjects/${subjectId}/units/${unitId}`} className={styles.breadcrumbLink}>
              Normalization
            </Link>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              chevron_right
            </span>
            <span className={styles.breadcrumbCurrent}>3NF</span>
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
          {/* Header Section */}
          <section className={styles.topicHeaderSection}>
            <h1 className={styles.topicMainTitle}>{topicData.title}</h1>
            <div className={styles.topicTagsRow}>
              <div className={styles.lastRevisedTag}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#005e79' }}>
                  calendar_clock
                </span>
                <span>Last Revised {topicData.lastRevised}</span>
              </div>
              <div className={styles.revisionDueTag}>
                <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                  assignment_late
                </span>
                <span>Revision Due: {topicData.questionsDue} Questions</span>
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
                  <p className={styles.aiOverviewBody}>{topicData.overview}</p>
                </div>
              </div>

              {/* CTA Area Card */}
              <div className={styles.ctaAreaCard}>
                <div className={styles.ctaBrainIcon}>
                  <span className="material-symbols-outlined">psychology</span>
                </div>
                <h3 className={styles.ctaHeading}>Ready to master 3NF?</h3>
                <p className={styles.ctaSubtitle}>{topicData.ctaSubtitle}</p>
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
                  <span className={styles.masteryBigNumber}>{topicData.mastery}</span>
                  <span className={styles.masteryPercent}>%</span>
                  <span className={styles.masteryWord}>Mastery</span>
                </div>

                <div className={styles.progressTrackWide}>
                  <div
                    className={styles.progressFillGradient}
                    style={{ width: `${topicData.mastery}%` }}
                  ></div>
                </div>

                <p className={styles.progressEncouragement}>Keep going!</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavBar />
    </div>
  );
};

export default TopicDetail;
