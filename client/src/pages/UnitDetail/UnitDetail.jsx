import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SideNavBar from '../../components/Navigation/SideNavBar';
import BottomNavBar from '../../components/Navigation/BottomNavBar';
import styles from './UnitDetail.module.css';

/**
 * UnitDetail Page handles:
 * - Task 14: Unit Detail: Normalization
 * - Task 16: Mobile Views
 */
const UnitDetail = () => {
  const { subjectId = 'dbms', unitId = 'normalization' } = useParams();
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

  const unitData = {
    tag: 'Unit 4',
    title: 'Normalization',
    desc: 'Master the concepts of database normalization, functional dependencies, and normal forms (1NF through BCNF) to design robust relational schemas.',
    mastery: 61,
    topicsCount: 6,
    revisionDue: 3,
    topics: [
      {
        id: 'fd',
        title: 'Functional Dependencies',
        desc: 'Understanding relationships between attributes and how they determine one another.',
        mastery: 86,
        status: 'strong',
        badge: 'Strong',
        fillColor: '#ffcc00',
      },
      {
        id: 'closure',
        title: 'Closure of Attributes',
        desc: 'Calculating the full set of attributes functionally determined by a given set.',
        mastery: 79,
        status: 'good',
        badge: 'Good',
        fillColor: '#2a22b5',
      },
      {
        id: '1nf',
        title: 'First Normal Form (1NF)',
        desc: 'Eliminating repeating groups and ensuring atomic values in relations.',
        mastery: 64,
        status: 'progress',
        badge: 'In Progress',
        fillColor: '#5e5ce6',
      },
      {
        id: '2nf',
        title: 'Second Normal Form (2NF)',
        desc: 'Removing partial dependencies to ensure all non-key attributes depend on the full primary key.',
        mastery: 58,
        status: 'progress',
        badge: 'In Progress',
        fillColor: '#5e5ce6',
      },
      {
        id: '3nf',
        title: 'Third Normal Form (3NF)',
        desc: 'Eliminating transitive dependencies to ensure non-key attributes depend solely on the primary key.',
        mastery: 42,
        status: 'attention',
        badge: 'Needs Attention',
        fillColor: '#ba1a1a',
        targetRoute: `/subjects/${subjectId}/units/${unitId}/topics/3nf`,
      },
      {
        id: 'bcnf',
        title: 'BCNF',
        desc: 'Boyce-Codd Normal Form: ensuring every determinant is a candidate key.',
        mastery: 35,
        status: 'started',
        badge: 'Just Started',
        fillColor: '#8cd0ef',
      },
    ],
  };

  const handleStartUnitRevision = () => {
    navigate(`/revision?unit=normalization`);
  };

  const handleDownloadNotes = () => {
    alert('Downloading study notes for Normalization...');
  };

  const getBadgeElement = (topic) => {
    switch (topic.status) {
      case 'strong':
        return (
          <span className={styles.badgeStrong}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              star
            </span>
            {topic.badge}
          </span>
        );
      case 'good':
        return (
          <span className={styles.badgeGood}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              check_circle
            </span>
            {topic.badge}
          </span>
        );
      case 'attention':
        return (
          <span className={styles.badgeAttention}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              warning
            </span>
            {topic.badge}
          </span>
        );
      case 'started':
        return (
          <span className={styles.badgeStarted}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              start
            </span>
            {topic.badge}
          </span>
        );
      default:
        return (
          <span className={styles.badgeProgress}>
            <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
              trending_up
            </span>
            {topic.badge}
          </span>
        );
    }
  };

  return (
    <div className={styles.unitLayout}>
      {/* Side Navigation */}
      <SideNavBar user={user} xpEarned={820} onQuickRevision={() => navigate('/revision')} />

      {/* Mobile Top App Bar */}
      <header className={styles.mobileTopBar}>
        <div className={styles.mobileBrand} onClick={() => navigate(`/subjects/${subjectId}`)}>
          <span className="material-symbols-outlined" style={{ color: '#4441cc', fontSize: '24px' }}>
            arrow_back
          </span>
          <span className={styles.mobileBrandTitle}>{unitData.title}</span>
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
            <Link to={`/subjects/${subjectId}`} className={styles.breadcrumbLink}>
              DBMS
            </Link>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              chevron_right
            </span>
            <span className={styles.breadcrumbCurrent}>{unitData.title}</span>
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
          {/* Unit Header Bento Grid */}
          <section className={styles.unitBentoGrid}>
            {/* Main Title & CTA Card */}
            <div className={styles.unitHeroCard}>
              <div>
                <div className={styles.unitTagPill}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
                    folder_open
                  </span>
                  <span>{unitData.tag}</span>
                </div>
                <h1 className={styles.unitTitle}>{unitData.title}</h1>
                <p className={styles.unitDesc}>{unitData.desc}</p>
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
                <div className={styles.masteryNumber}>{unitData.mastery}%</div>
                <div className={styles.sparkTrack}>
                  <div
                    className={styles.sparkFill}
                    style={{ width: `${unitData.mastery}%` }}
                  ></div>
                </div>
                <p className={styles.masterySubNote}>
                  {100 - unitData.mastery}% remaining to mastery
                </p>
              </div>

              {/* Meta Stats 2-Grid */}
              <div className={styles.metaStatsGrid}>
                <div className={styles.metaCard}>
                  <span className="material-symbols-outlined" style={{ color: '#464554' }}>
                    view_list
                  </span>
                  <span className={styles.metaCardVal}>{unitData.topicsCount}</span>
                  <span className={styles.metaCardLabel}>Topics</span>
                </div>
                <div className={`${styles.metaCard} ${styles.metaCardError}`}>
                  <span className="material-symbols-outlined" style={{ color: '#ba1a1a' }}>
                    schedule
                  </span>
                  <span className={`${styles.metaCardVal} ${styles.metaCardValError}`}>
                    {unitData.revisionDue}
                  </span>
                  <span className={styles.metaCardLabel} style={{ color: '#ba1a1a' }}>
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
              {unitData.topics.map((topic) => {
                const isAttention = topic.status === 'attention';

                return (
                  <div
                    key={topic.id}
                    className={`${styles.topicCard} ${isAttention ? styles.topicCardAttention : ''}`}
                  >
                    <div>
                      <div className={styles.topicTopRow}>
                        {getBadgeElement(topic)}
                        <span
                          className={`${styles.topicMasteryNumber} ${isAttention ? styles.topicMasteryNumberError : ''}`}
                        >
                          {topic.mastery}%
                        </span>
                      </div>
                      <h3 className={styles.topicCardTitle}>{topic.title}</h3>
                      <p className={styles.topicCardDesc}>{topic.desc}</p>
                    </div>

                    <div>
                      <div className={styles.topicCardProgressTrack}>
                        <div
                          className={styles.topicCardProgressFill}
                          style={{
                            width: `${topic.mastery}%`,
                            backgroundColor: topic.fillColor,
                          }}
                        ></div>
                      </div>
                      <button
                        className={`${styles.reviewTopicBtn} ${isAttention ? styles.reviewTopicBtnAttention : ''}`}
                        onClick={() => {
                          if (topic.targetRoute) {
                            navigate(topic.targetRoute);
                          } else {
                            navigate(
                              `/subjects/${subjectId}/units/${unitId}/topics/${topic.id}`
                            );
                          }
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
              })}
            </div>
          </section>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavBar />
    </div>
  );
};

export default UnitDetail;
