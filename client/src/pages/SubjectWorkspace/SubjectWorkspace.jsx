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
 * - Task 24: Dynamic Data Integration
 */
const SubjectWorkspace = () => {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [subjectData, setSubjectData] = useState(null);
  const [units, setUnits] = useState([]);
  const [unitTopicsMap, setUnitTopicsMap] = useState({});
  const [loadingTopics, setLoadingTopics] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedUnit, setExpandedUnit] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [user, setUser] = useState(null);

  const fetchSubjectAndUnits = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!subjectId) {
        throw new Error('No subject ID provided');
      }

      // 1. Fetch Subject Details
      const subjectRes = await fetch(`/api/subjects/${subjectId}`, { credentials: 'include' });
      const subjectJson = await subjectRes.json();

      if (!subjectRes.ok || !subjectJson.success) {
        throw new Error(subjectJson.message || subjectJson.error || 'Subject not found');
      }

      const fetchedSubject = subjectJson.subject;
      setSubjectData(fetchedSubject);

      // 2. Fetch Subject Units
      try {
        const unitsRes = await fetch(`/api/subjects/${subjectId}/units`, { credentials: 'include' });
        const unitsJson = await unitsRes.json();
        if (unitsRes.ok && unitsJson.success && Array.isArray(unitsJson.data)) {
          setUnits(unitsJson.data);
          if (unitsJson.data.length > 0) {
            setExpandedUnit(unitsJson.data[0]._id);
            fetchTopicsForUnit(unitsJson.data[0]._id);
          }
        } else {
          setUnits([]);
        }
      } catch (unitErr) {
        console.warn('Could not fetch units for subject:', unitErr);
        setUnits([]);
      }
    } catch (err) {
      console.error('Error loading subject workspace:', err);
      setError(err.message || 'Unable to load subject workspace');
    } finally {
      setLoading(false);
    }
  };

  const fetchTopicsForUnit = async (unitId) => {
    if (!unitId || unitTopicsMap[unitId] || loadingTopics[unitId]) return;

    setLoadingTopics((prev) => ({ ...prev, [unitId]: true }));
    try {
      const res = await fetch(`/api/units/${unitId}/topics`, { credentials: 'include' });
      const json = await res.json();
      if (res.ok && json.success && Array.isArray(json.data)) {
        setUnitTopicsMap((prev) => ({ ...prev, [unitId]: json.data }));
      } else {
        setUnitTopicsMap((prev) => ({ ...prev, [unitId]: [] }));
      }
    } catch (err) {
      console.error(`Error fetching topics for unit ${unitId}:`, err);
      setUnitTopicsMap((prev) => ({ ...prev, [unitId]: [] }));
    } finally {
      setLoadingTopics((prev) => ({ ...prev, [unitId]: false }));
    }
  };

  useEffect(() => {
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {
      console.error(e);
    }

    fetchSubjectAndUnits();
  }, [subjectId]);

  const toggleUnit = (unitId) => {
    if (expandedUnit === unitId) {
      setExpandedUnit(null);
    } else {
      setExpandedUnit(unitId);
      fetchTopicsForUnit(unitId);
    }
  };

  const subjectName = subjectData?.name || 'Subject Workspace';
  const shortSubjectName = subjectData?.name || 'Subject';

  const handleStartRevision = () => {
    navigate(`/revision?subject=${encodeURIComponent(subjectName)}`);
  };

  // Calculate dynamic metrics
  const totalUnitsCount = units.length > 0 ? units.length : (subjectData?.totalUnits ?? 0);
  const totalTopicsCount =
    units.length > 0
      ? units.reduce((sum, u) => sum + (u.totalTopics || 0), 0)
      : (subjectData?.totalTopics ?? 0);
  const totalQuestionsCount = subjectData?.totalQuestions ?? 0;
  const subjectMastery = subjectData?.mastery ?? 0;

  // Find least mastered unit for smart recommendation
  const recommendedUnit =
    units.length > 0
      ? [...units].sort((a, b) => (a.mastery || 0) - (b.mastery || 0))[0]
      : null;

  const studyMaterials = [
    { id: 'm1', type: 'pdf', title: `${subjectName.replace(/\s+/g, '_')}_Syllabus.pdf`, sub: 'Syllabus document', iconClass: styles.matPdf, icon: 'picture_as_pdf' },
    { id: 'm2', type: 'folder', title: 'Previous Year Qs', sub: 'Practice questions', iconClass: styles.matFolder, icon: 'folder' },
    { id: 'm3', type: 'notes', title: 'Class Notes', sub: 'Study notes', iconClass: styles.matNotes, icon: 'description' },
    { id: 'm4', type: 'attach', title: 'References', sub: 'Key concepts', iconClass: styles.matAttach, icon: 'attach_file' },
  ];

  return (
    <div className={styles.workspaceLayout}>
      {/* Desktop Side Navigation */}
      <SideNavBar user={user} xpEarned={user?.progress?.xp || user?.xp || 0} onQuickRevision={() => navigate('/revision')} />

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
          {/* Loading State */}
          {loading && (
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p className={styles.loadingText}>Loading subject workspace...</p>
            </div>
          )}

          {/* Error / Not Found State */}
          {error && !loading && (
            <div className={styles.errorContainer}>
              <span className="material-symbols-outlined" style={{ fontSize: '56px', color: '#ba1a1a' }}>
                cloud_off
              </span>
              <h2 className={styles.errorTitle}>Subject Not Found</h2>
              <p className={styles.errorMessage}>{error}</p>
              <div className={styles.errorActionGroup}>
                <button className={styles.retryBtn} onClick={fetchSubjectAndUnits}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    refresh
                  </span>
                  <span>Retry</span>
                </button>
                <button className={styles.backBtn} onClick={() => navigate('/subjects')}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    arrow_back
                  </span>
                  <span>Back to Subjects</span>
                </button>
              </div>
            </div>
          )}

          {/* Workspace Loaded State */}
          {!loading && !error && (
            <>
              {/* Subject Header Banner */}
              <section className={styles.subjectBanner}>
                <div className={styles.bannerLeft}>
                  <div
                    className={styles.subjectBigIconBox}
                    style={{ backgroundColor: subjectData?.colour ? subjectData.colour + '20' : '#f5f2fe' }}
                  >
                    <span>📚</span>
                  </div>
                  <div>
                    <h1 className={styles.bannerTitle}>{subjectName}</h1>
                    <p className={styles.bannerSubtitle}>
                      {subjectData?.description || `Your personalized ${shortSubjectName} learning workspace.`}
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
                  <div className={styles.statCardNumber}>{subjectMastery}%</div>
                  <div className={styles.xpTrack}>
                    <div className={styles.xpFill} style={{ width: `${subjectMastery}%` }}></div>
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
                  <div className={styles.statCardNumber}>{totalUnitsCount}</div>
                </div>

                {/* Topics Stat */}
                <div className={styles.statCard}>
                  <div className={styles.statCardHeader}>
                    <span className={styles.statCardLabel}>Topics</span>
                    <span className={`material-symbols-outlined ${styles.statCardIcon}`} style={{ color: '#9026c3' }}>
                      list_alt
                    </span>
                  </div>
                  <div className={styles.statCardNumber}>{totalTopicsCount}</div>
                </div>

                {/* Questions Stat */}
                <div className={`${styles.statCard} ${styles.statCardOrangeBorder}`}>
                  <div className={styles.statCardHeader}>
                    <span className={styles.statCardLabel}>Questions</span>
                    <span className={`material-symbols-outlined ${styles.statCardIcon}`} style={{ color: '#ff9500' }}>
                      quiz
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline' }}>
                    <span className={styles.statCardNumber}>{totalQuestionsCount}</span>
                    <span className={styles.statSubLabel}>Qs</span>
                  </div>
                </div>
              </section>

              {/* Main 2-Column Layout */}
              <div className={styles.workspaceColumns}>
                {/* Left Column: Syllabus (60%) */}
                <div className={styles.leftColumn}>
                  <h2 className={styles.sectionHeading}>Your Syllabus</h2>

                  {units.length === 0 ? (
                    <div className={styles.emptyUnitsCard}>
                      <span className={`material-symbols-outlined ${styles.emptyUnitsIcon}`}>
                        menu_book
                      </span>
                      <h3 className={styles.emptyUnitsTitle}>No units created yet</h3>
                      <p className={styles.emptyUnitsSubtitle}>
                        Upload your syllabus document to automatically extract and structure units and topics for this subject.
                      </p>
                      <button
                        className={styles.uploadMaterialBtn}
                        onClick={() => setIsUploadModalOpen(true)}
                        style={{ marginTop: '8px' }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          upload
                        </span>
                        <span>Upload Syllabus</span>
                      </button>
                    </div>
                  ) : (
                    units.map((unit, index) => {
                      const isExpanded = expandedUnit === unit._id;
                      const unitBadge = `U${unit.order != null ? unit.order : index + 1}`;
                      const unitMastery = unit.mastery || 0;
                      const isMastered = unitMastery >= 100 || (unit.completedTopics > 0 && unit.completedTopics === unit.totalTopics);
                      const unitTopics = unitTopicsMap[unit._id] || [];
                      const isTopicsLoading = loadingTopics[unit._id];

                      return (
                        <div key={unit._id} className={styles.unitCard}>
                          <div
                            className={styles.unitCardHeader}
                            onClick={() => toggleUnit(unit._id)}
                          >
                            <div className={styles.unitHeaderLeft}>
                              <div
                                className={`${styles.unitBadge} ${!isMastered && unitMastery === 0 ? styles.unitBadgeMuted : ''}`}
                              >
                                {unitBadge}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', flexWrap: 'wrap' }}>
                                  <h3 className={styles.unitTitle}>{unit.name}</h3>
                                  <Link
                                    to={`/subjects/${subjectId}/units/${unit._id}`}
                                    className={styles.viewUnitLink}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <span>Unit Details</span>
                                    <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                                      arrow_forward
                                    </span>
                                  </Link>
                                </div>
                                <div className={styles.unitMetaRow}>
                                  <span>{unit.totalTopics ?? unitTopics.length} Topics</span>
                                  <div className={styles.unitProgressTrack}>
                                    <div
                                      className={styles.unitProgressFill}
                                      style={{ width: `${unitMastery}%` }}
                                    ></div>
                                  </div>
                                  {isMastered ? (
                                    <span className={styles.unitMasteredTag}>Mastered</span>
                                  ) : (
                                    <span style={{ fontWeight: 700, color: '#4441cc' }}>
                                      {unitMastery}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="material-symbols-outlined" style={{ color: '#464554', marginLeft: '12px' }}>
                              {isExpanded ? 'expand_less' : 'expand_more'}
                            </span>
                          </div>

                          {isExpanded && (
                            <div className={styles.unitTopicsList}>
                              {isTopicsLoading && (
                                <p className={styles.unitTopicsLoading}>Loading topics...</p>
                              )}

                              {!isTopicsLoading && unitTopics.length === 0 && (
                                <p className={styles.emptyTopicsMsg}>No topics found in this unit.</p>
                              )}

                              {!isTopicsLoading && unitTopics.map((topic) => (
                                <div
                                  key={topic._id}
                                  className={styles.topicItemRow}
                                  onClick={() =>
                                    navigate(
                                      `/subjects/${subjectId}/units/${unit._id}/topics/${topic._id}`
                                    )
                                  }
                                >
                                  <div className={styles.topicItemLeft}>
                                    <span
                                      className={`material-symbols-outlined ${styles.topicCheckIcon}`}
                                      style={{
                                        color: topic.status === 'completed' || (topic.mastery || 0) >= 80 ? '#ffcc00' : '#c7c4d7',
                                        fontVariationSettings: "'FILL' 1",
                                      }}
                                    >
                                      {topic.status === 'completed' ? 'check_circle' : 'radio_button_unchecked'}
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
                    })
                  )}
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
                      {recommendedUnit ? (
                        <>
                          <p className={styles.insightBody}>
                            To build overall mastery in <strong>{subjectName}</strong>, focusing next on{' '}
                            <strong>{recommendedUnit.name}</strong> will give you the fastest retention boost.
                          </p>
                          <button
                            className={styles.reviewUnitBtn}
                            onClick={() =>
                              navigate(`/subjects/${subjectId}/units/${recommendedUnit._id}`)
                            }
                          >
                            Review {recommendedUnit.name}
                          </button>
                        </>
                      ) : (
                        <>
                          <p className={styles.insightBody}>
                            Welcome to <strong>{subjectName}</strong>! Upload your syllabus to extract units, topics, and personalized flashcards for targeted revision.
                          </p>
                          <button
                            className={styles.reviewUnitBtn}
                            onClick={() => setIsUploadModalOpen(true)}
                          >
                            Upload Syllabus
                          </button>
                        </>
                      )}
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
            </>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavBar />

      {/* Upload Material Modal */}
      <UploadSyllabusModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        initialSubjectId={subjectId}
      />
    </div>
  );
};

export default SubjectWorkspace;
