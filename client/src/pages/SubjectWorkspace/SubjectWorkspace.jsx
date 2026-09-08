import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import SideNavBar from '../../components/Navigation/SideNavBar';
import BottomNavBar from '../../components/Navigation/BottomNavBar';
import UploadSyllabusModal from '../../components/UploadSyllabusModal/UploadSyllabusModal';
import styles from './SubjectWorkspace.module.css';

/**
 * SubjectWorkspace Page handles:
 * - Task 13: DBMS Subject Workspace - Redesign
 * - Task 16: Mobile Views
 */
const SubjectWorkspace = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subjectData, setSubjectData] = useState(null);
  const [expandedUnit, setExpandedUnit] = useState('u1');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }

    const fetchSubject = async () => {
      try {
        if (subjectId && subjectId !== 'dbms' && subjectId.length === 24) {
          const res = await fetch(`/api/subjects/${subjectId}`, { credentials: 'include' });
          const data = await res.json();
          if (res.ok && data.success) {
            setSubjectData(data.subject);
          }
        }
      } catch (err) {
        console.error('Error loading subject', err);
      }
    };
    fetchSubject();
  }, [subjectId]);

  const subjectName = subjectData?.name || 'Database Management Systems';
  const shortSubjectName =
    subjectName.toLowerCase().includes('database') || subjectName.toLowerCase().includes('dbms')
      ? 'DBMS'
      : subjectName;

  const toggleUnit = (unitId) => {
    setExpandedUnit((prev) => (prev === unitId ? null : unitId));
  };

  const handleStartRevision = () => {
    navigate(`/revision?subject=${encodeURIComponent(shortSubjectName)}`);
  };

  const unitsList = [
    {
      id: 'u1',
      badge: 'U1',
      title: 'Introduction to DBMS',
      topicsCount: 3,
      mastery: 100,
      isMastered: true,
      topics: [
        { id: 't1', name: 'DBMS Architecture' },
        { id: 't2', name: 'Data Models' },
        { id: 't3', name: 'Database Schema' },
      ],
    },
    {
      id: 'u2',
      badge: 'U2',
      title: 'Relational Model & SQL',
      topicsCount: 4,
      mastery: 75,
      isMastered: false,
      topics: [
        { id: 't4', name: 'Relational Algebra' },
        { id: 't5', name: 'SQL Queries & Joins' },
        { id: 't6', name: 'Integrity Constraints' },
        { id: 't7', name: 'Views and Triggers' },
      ],
    },
    {
      id: 'u3',
      badge: 'U3',
      title: 'Database Design & Normalization',
      topicsCount: 3,
      mastery: 40,
      isMastered: false,
      navPath: `/subjects/${subjectId || 'dbms'}/units/normalization`,
      topics: [
        { id: 't8', name: 'Functional Dependencies' },
        { id: 't9', name: 'Closure & Candidate Keys' },
        { id: 't10', name: 'Normal Forms (1NF, 2NF, 3NF, BCNF)' },
      ],
    },
    {
      id: 'u4',
      badge: 'U4',
      title: 'Transaction Management',
      topicsCount: 2,
      mastery: 0,
      isMastered: false,
      topics: [
        { id: 't11', name: 'ACID Properties' },
        { id: 't12', name: 'Concurrency Control Protocols' },
      ],
    },
  ];

  const studyMaterials = [
    { id: 'm1', type: 'pdf', title: 'DBMS_Syllabus.pdf', sub: 'Added 2 weeks ago', iconClass: styles.matPdf, icon: 'picture_as_pdf' },
    { id: 'm2', type: 'folder', title: 'Previous Year Qs', sub: '3 files', iconClass: styles.matFolder, icon: 'folder' },
    { id: 'm3', type: 'notes', title: 'Class Notes', sub: '4 files', iconClass: styles.matNotes, icon: 'description' },
    { id: 'm4', type: 'attach', title: 'Other References', sub: '2 files', iconClass: styles.matAttach, icon: 'attach_file' },
  ];

  return (
    <div className={styles.workspaceLayout}>
      {/* Desktop Side Navigation */}
      <SideNavBar user={user} xpEarned={820} onQuickRevision={() => navigate('/revision')} />

      {/* Mobile Top App Bar */}
      <header className={styles.mobileTopBar}>
        <div className={styles.mobileBrand} onClick={() => navigate('/subjects')}>
          <span className="material-symbols-outlined" style={{ color: '#4441cc', fontSize: '24px' }}>
            arrow_back
          </span>
          <span className={styles.mobileBrandTitle}>{shortSubjectName}</span>
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
      <main className={styles.mainContainer}>
        {/* Desktop Sticky Header */}
        <header className={styles.topHeader}>
          <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
            <Link to="/subjects" className={styles.breadcrumbLink}>
              Subjects
            </Link>
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              chevron_right
            </span>
            <span className={styles.breadcrumbCurrent}>{shortSubjectName}</span>
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
          {/* Subject Header Banner */}
          <section className={styles.subjectBanner}>
            <div className={styles.bannerLeft}>
              <div className={styles.subjectBigIconBox}>
                <span>🗄️</span>
              </div>
              <div>
                <h1 className={styles.bannerTitle}>{subjectName}</h1>
                <p className={styles.bannerSubtitle}>
                  Your personalized {shortSubjectName} learning workspace.
                </p>
              </div>
            </div>
            <div className={styles.bannerActions}>
              <button
                className={styles.uploadMaterialBtn}
                onClick={() => setIsUploadModalOpen(true)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  upload
                </span>
                <span>Upload Material</span>
              </button>
              <button className={styles.startRevisionBtn} onClick={handleStartRevision}>
                <span>Start Revision</span>
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  arrow_forward
                </span>
              </button>
            </div>
          </section>

          {/* Stats Row */}
          <section className={styles.statsRow}>
            {/* Mastery Stat */}
            <div className={styles.statCard}>
              <div className={styles.statCardHeader}>
                <span className={styles.statCardLabel}>Mastery</span>
                <span
                  className={`material-symbols-outlined ${styles.statCardIcon}`}
                  style={{ color: '#ffcc00', fontVariationSettings: "'FILL' 1" }}
                >
                  workspace_premium
                </span>
              </div>
              <div className={styles.statCardNumber}>82%</div>
              <div className={styles.xpTrack}>
                <div className={styles.xpFill} style={{ width: '82%' }}></div>
              </div>
            </div>

            {/* Units Stat */}
            <div className={styles.statCard}>
              <div className={styles.statCardHeader}>
                <span className={styles.statCardLabel}>Units</span>
                <span className={`material-symbols-outlined ${styles.statCardIcon}`} style={{ color: '#2a22b5' }}>
                  view_module
                </span>
              </div>
              <div className={styles.statCardNumber}>5</div>
            </div>

            {/* Topics Stat */}
            <div className={styles.statCard}>
              <div className={styles.statCardHeader}>
                <span className={styles.statCardLabel}>Topics</span>
                <span className={`material-symbols-outlined ${styles.statCardIcon}`} style={{ color: '#9026c3' }}>
                  list_alt
                </span>
              </div>
              <div className={styles.statCardNumber}>12</div>
            </div>

            {/* Revision Due Stat */}
            <div className={`${styles.statCard} ${styles.statCardOrangeBorder}`}>
              <div className={styles.statCardHeader}>
                <span className={styles.statCardLabel}>Revision Due</span>
                <span className={`material-symbols-outlined ${styles.statCardIcon}`} style={{ color: '#ff9500' }}>
                  event_repeat
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline' }}>
                <span className={styles.statCardNumber}>4</span>
                <span className={styles.statSubLabel}>Topics</span>
              </div>
            </div>
          </section>

          {/* Main 2-Column Layout */}
          <div className={styles.workspaceColumns}>
            {/* Left Column: Syllabus (60%) */}
            <div className={styles.leftColumn}>
              <h2 className={styles.sectionHeading}>Your Syllabus</h2>

              {unitsList.map((unit) => {
                const isExpanded = expandedUnit === unit.id;

                return (
                  <div key={unit.id} className={styles.unitCard}>
                    <div
                      className={styles.unitCardHeader}
                      onClick={() => {
                        if (unit.navPath) {
                          navigate(unit.navPath);
                        } else {
                          toggleUnit(unit.id);
                        }
                      }}
                    >
                      <div className={styles.unitHeaderLeft}>
                        <div
                          className={`${styles.unitBadge} ${!unit.isMastered && unit.mastery === 0 ? styles.unitBadgeMuted : ''}`}
                        >
                          {unit.badge}
                        </div>
                        <div>
                          <h3 className={styles.unitTitle}>{unit.title}</h3>
                          <div className={styles.unitMetaRow}>
                            <span>{unit.topicsCount} Topics</span>
                            <div className={styles.unitProgressTrack}>
                              <div
                                className={styles.unitProgressFill}
                                style={{ width: `${unit.mastery}%` }}
                              ></div>
                            </div>
                            {unit.isMastered ? (
                              <span className={styles.unitMasteredTag}>Mastered</span>
                            ) : (
                              <span style={{ fontWeight: 700, color: '#4441cc' }}>
                                {unit.mastery}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className="material-symbols-outlined" style={{ color: '#464554' }}>
                        {isExpanded ? 'expand_less' : 'expand_more'}
                      </span>
                    </div>

                    {isExpanded && unit.topics && (
                      <div className={styles.unitTopicsList}>
                        {unit.topics.map((topic) => (
                          <div
                            key={topic.id}
                            className={styles.topicItemRow}
                            onClick={() =>
                              navigate(
                                `/subjects/${subjectId || 'dbms'}/units/normalization/topics/3nf`
                              )
                            }
                          >
                            <div className={styles.topicItemLeft}>
                              <span
                                className={`material-symbols-outlined ${styles.topicCheckIcon}`}
                                style={{ fontVariationSettings: "'FILL' 1" }}
                              >
                                check_circle
                              </span>
                              <span className={styles.topicName}>{topic.name}</span>
                            </div>
                            <button
                              className={styles.reviseTopicBtn}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(
                                  `/revision?topic=${encodeURIComponent(topic.name)}`
                                );
                              }}
                            >
                              Revise
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Right Column: Smart Insights & Materials (40%) */}
            <div className={styles.rightColumn}>
              {/* Smart Insights Card */}
              <div>
                <h2 className={styles.sectionHeading}>Smart Insights</h2>
                <div className={styles.smartInsightCard}>
                  <div className={styles.insightHeader}>
                    <div className={styles.insightIconCircle}>
                      <span
                        className="material-symbols-outlined"
                        style={{ fontVariationSettings: "'FILL' 1", fontSize: '20px' }}
                      >
                        auto_awesome
                      </span>
                    </div>
                    <h3 className={styles.insightTitle}>AI Study Insight</h3>
                  </div>
                  <p className={styles.insightBody}>
                    You struggled with <strong>Normalization</strong> during the last quiz. I
                    recommend reviewing the 3NF and BCNF flashcards before starting a new unit.
                  </p>
                  <button
                    className={styles.reviewUnitBtn}
                    onClick={() =>
                      navigate(`/subjects/${subjectId || 'dbms'}/units/normalization`)
                    }
                  >
                    Review Normalization
                  </button>
                </div>
              </div>

              {/* Study Materials */}
              <div>
                <h2 className={styles.sectionHeading}>Study Materials</h2>
                <div className={styles.materialsGrid}>
                  {studyMaterials.map((mat) => (
                    <div
                      key={mat.id}
                      className={styles.materialCard}
                      onClick={() => setIsUploadModalOpen(true)}
                    >
                      <div className={styles.materialCardTop}>
                        <div className={`${styles.materialIconBadge} ${mat.iconClass}`}>
                          <span className="material-symbols-outlined">{mat.icon}</span>
                        </div>
                        <span className="material-symbols-outlined" style={{ color: '#777586' }}>
                          more_vert
                        </span>
                      </div>
                      <h4 className={styles.materialTitle}>{mat.title}</h4>
                      <p className={styles.materialSub}>{mat.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavBar />

      {/* Upload Material Modal */}
      <UploadSyllabusModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        initialSubjectId={subjectId || 'dbms'}
      />
    </div>
  );
};

export default SubjectWorkspace;
