import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideNavBar from '../../components/Navigation/SideNavBar';
import BottomNavBar from '../../components/Navigation/BottomNavBar';
import CreateSubjectModal from '../../components/CreateSubjectModal/CreateSubjectModal';
import UploadSyllabusModal from '../../components/UploadSyllabusModal/UploadSyllabusModal';
import styles from './Subjects.module.css';

/**
 * Subjects Page handles:
 * - Task 8: Subjects - Empty State
 * - Task 12: Subjects - Populated State
 * - Task 16: Mobile Views
 */
const Subjects = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Fetch subjects from backend
  const fetchSubjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/subjects', { credentials: 'include' });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to fetch subjects');
      }
      setSubjects(data.subjects || []);
    } catch (err) {
      console.error('Failed to load subjects:', err);
      setError(err.message || 'Unable to connect to server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error('Failed to parse user', e);
    }
    fetchSubjects();
  }, []);

  const handleCreateSubjectSubmit = async (formData) => {
    try {
      const response = await fetch('/api/subjects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        alert(data.error || 'Failed to create subject');
        return;
      }
      setIsCreateModalOpen(false);
      fetchSubjects();
    } catch (err) {
      alert(err.message || 'Failed to connect to server');
    }
  };

  // Sample data fallback if server has subjects or when exploring redesign
  const displaySubjects = subjects.length > 0 ? subjects : [];

  // Filter subjects
  const filteredSubjects = displaySubjects.filter((sub) => {
    const matchesSearch = sub.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (activeFilter === 'needs_attention') {
      return (sub.mastery || 0) < 70;
    }
    if (activeFilter === 'on_track') {
      return (sub.mastery || 0) >= 70 && (sub.mastery || 0) < 85;
    }
    if (activeFilter === 'strong') {
      return (sub.mastery || 0) >= 85;
    }
    return true;
  });

  // Calculate overview metrics
  const totalSubjectsCount = displaySubjects.length;
  const avgMastery =
    totalSubjectsCount > 0
      ? Math.round(
          displaySubjects.reduce((acc, s) => acc + (s.mastery || 0), 0) / totalSubjectsCount
        )
      : 0;

  const totalRevisionDue = displaySubjects.reduce(
    (acc, s) => acc + (s.topicsNeedingReview || 4),
    0
  );
  const weakTopicsCount = displaySubjects.filter((s) => (s.mastery || 0) < 70).length;

  const getStatusBadge = (mastery = 80) => {
    if (mastery >= 90) return { label: 'Excellent', className: styles.statusExcellent };
    if (mastery >= 75) return { label: 'Strong', className: styles.statusStrong };
    return { label: 'Needs Practice', className: styles.statusNeedsPractice };
  };

  const getSubjectColorTheme = (index, colorCode) => {
    if (colorCode) return { bg: colorCode + '20', color: colorCode };
    const palette = [
      { bg: '#e2dfff', color: '#2a22b5' },
      { bg: '#bde9ff', color: '#005e79' },
      { bg: '#f7d9ff', color: '#9026c3' },
    ];
    return palette[index % palette.length];
  };

  return (
    <div className={styles.pageLayout}>
      {/* Desktop Side Navigation */}
      <SideNavBar user={user} xpEarned={820} onQuickRevision={() => navigate('/revision')} />

      {/* Mobile Top App Bar */}
      <header className={styles.mobileTopBar}>
        <div className={styles.mobileBrand} onClick={() => navigate('/home')}>
          <span
            className="material-symbols-outlined"
            style={{ color: '#4441cc', fontVariationSettings: "'FILL' 1", fontSize: '24px' }}
          >
            auto_awesome
          </span>
          <span className={styles.mobileBrandTitle}>ReviseAI</span>
        </div>
        <button
          className={styles.mobileProfileBtn}
          onClick={() => navigate('/settings')}
          aria-label="User Profile"
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: '28px', color: '#464554' }}
          >
            account_circle
          </span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className={styles.mainContainer}>
        {/* Desktop Sticky Header */}
        <header className={styles.topHeader}>
          <h1 className={styles.pageHeaderTitle}>Subjects</h1>
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
          {/* LOADING STATE */}
          {loading && (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#464554' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid #e4e1ed',
                  borderTopColor: '#5e5ce6',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto 16px auto',
                }}
              ></div>
              <p>Loading subjects...</p>
              <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* ERROR STATE */}
          {error && !loading && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#ba1a1a' }}>
                cloud_off
              </span>
              <h3 style={{ marginTop: '12px', color: '#1b1b23' }}>Unable to load subjects</h3>
              <p style={{ color: '#464554', marginBottom: '20px' }}>{error}</p>
              <button
                className={styles.createSubjectBtn}
                onClick={fetchSubjects}
                style={{ margin: '0 auto' }}
              >
                Retry
              </button>
            </div>
          )}

          {/* TASK 8: EMPTY STATE */}
          {!loading && !error && displaySubjects.length === 0 && (
            <section className={styles.emptyStateContainer}>
              <div className={styles.emptyStateIllustrationWrapper}>
                <div className={styles.emptyStateGlow}></div>
                <span
                  className={`material-symbols-outlined ${styles.emptyIllustrationIcon}`}
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  menu_book
                </span>
              </div>
              <h2 className={styles.emptyStateTitle}>No subjects yet</h2>
              <p className={styles.emptyStateDesc}>
                Create your first subject and let ReviseAI organize your learning journey.
              </p>
              <div className={styles.emptyStateActions}>
                <button
                  className={styles.createSubjectBtn}
                  onClick={() => setIsCreateModalOpen(true)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    add
                  </span>
                  <span>Create Subject</span>
                </button>
                <button
                  className={styles.uploadSyllabusBtn}
                  onClick={() => setIsUploadModalOpen(true)}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    upload_file
                  </span>
                  <span>Upload Syllabus</span>
                </button>
              </div>
            </section>
          )}

          {/* TASK 12: POPULATED STATE */}
          {!loading && !error && displaySubjects.length > 0 && (
            <>
              {/* Page Hero Header */}
              <div className={styles.populatedHeroRow}>
                <div>
                  <h2 className={styles.heroTitle}>Your Subjects</h2>
                  <p className={styles.heroSubtitle}>
                    Track your progress and continue learning at your own pace.
                  </p>
                </div>
                <div className={styles.heroActionGroup}>
                  <button
                    className={styles.uploadSyllabusBtn}
                    onClick={() => setIsUploadModalOpen(true)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      upload
                    </span>
                    <span>Upload Materials</span>
                  </button>
                  <button
                    className={styles.createSubjectBtn}
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      add
                    </span>
                    <span>Add Subject</span>
                  </button>
                </div>
              </div>

              {/* Overview Metrics */}
              <div className={styles.metricsGrid}>
                {/* Metric 1: Total Subjects */}
                <div className={styles.metricCard}>
                  <div className={`${styles.metricIconCircle} ${styles.iconSubjects}`}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      book
                    </span>
                  </div>
                  <div>
                    <div className={styles.metricLabel}>Total Subjects</div>
                    <div className={styles.metricBigNumber}>{totalSubjectsCount}</div>
                  </div>
                </div>

                {/* Metric 2: Average Mastery */}
                <div className={styles.metricCard}>
                  <div className={`${styles.metricIconCircle} ${styles.iconMastery}`}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      psychology
                    </span>
                  </div>
                  <div>
                    <div className={styles.metricLabel}>Average Mastery</div>
                    <div className={styles.metricBigNumber} style={{ color: '#4441cc' }}>
                      {avgMastery || 76}%
                    </div>
                  </div>
                </div>

                {/* Metric 3: Revision Due */}
                <div className={styles.metricCard}>
                  <div className={`${styles.metricIconCircle} ${styles.iconRevision}`}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      bolt
                    </span>
                  </div>
                  <div>
                    <div className={styles.metricLabel}>Revision Due</div>
                    <div className={styles.metricBigNumber}>{totalRevisionDue}</div>
                  </div>
                </div>

                {/* Metric 4: Weak Topics */}
                <div className={styles.metricCard}>
                  <div className={`${styles.metricIconCircle} ${styles.iconWeak}`}>
                    <span
                      className="material-symbols-outlined"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      my_location
                    </span>
                  </div>
                  <div>
                    <div className={styles.metricLabel}>Weak Topics</div>
                    <div className={styles.metricBigNumber}>{weakTopicsCount || 3}</div>
                  </div>
                </div>
              </div>

              {/* Discovery Toolbar */}
              <div className={styles.toolbarRow}>
                <div className={styles.searchWrapper}>
                  <span className={`material-symbols-outlined ${styles.searchIcon}`}>search</span>
                  <input
                    type="text"
                    className={styles.searchInput}
                    placeholder="Search subjects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className={styles.filterChipsGroup}>
                  <button
                    className={`${styles.filterChip} ${activeFilter === 'all' ? styles.filterChipActive : ''}`}
                    onClick={() => setActiveFilter('all')}
                  >
                    All Subjects
                  </button>
                  <button
                    className={`${styles.filterChip} ${activeFilter === 'needs_attention' ? styles.filterChipActive : ''}`}
                    onClick={() => setActiveFilter('needs_attention')}
                  >
                    Needs Attention
                  </button>
                  <button
                    className={`${styles.filterChip} ${activeFilter === 'on_track' ? styles.filterChipActive : ''}`}
                    onClick={() => setActiveFilter('on_track')}
                  >
                    On Track
                  </button>
                  <button
                    className={`${styles.filterChip} ${activeFilter === 'strong' ? styles.filterChipActive : ''}`}
                    onClick={() => setActiveFilter('strong')}
                  >
                    Strong
                  </button>
                </div>
              </div>

              {/* Subject Grid */}
              <div className={styles.subjectGrid}>
                {filteredSubjects.map((subject, idx) => {
                  const mastery = subject.mastery ?? 82;
                  const status = getStatusBadge(mastery);
                  const theme = getSubjectColorTheme(idx, subject.colour);
                  const subjectId = subject._id || subject.id || 'dbms';

                  return (
                    <div key={subjectId} className={styles.subjectCard}>
                      <div className={styles.cardHeaderRow}>
                        <div className={styles.cardHeaderLeft}>
                          <div
                            className={styles.subjectIconBox}
                            style={{ backgroundColor: theme.bg, color: theme.color }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontVariationSettings: "'FILL' 1" }}
                            >
                              storage
                            </span>
                          </div>
                          <div>
                            <h3 className={styles.subjectTitle}>{subject.name}</h3>
                            <p className={styles.subjectTopicCount}>
                              {subject.totalTopics || 12} Topics • {subject.totalQuestions || 150} Qs
                            </p>
                          </div>
                        </div>
                        <span className={`${styles.statusTag} ${status.className}`}>
                          {status.label}
                        </span>
                      </div>

                      <div className={styles.cardBody}>
                        <div className={styles.masteryRow}>
                          <span className={styles.masteryLabel}>Mastery</span>
                          <span className={styles.masteryVal} style={{ color: theme.color }}>
                            {mastery}%
                          </span>
                        </div>
                        <div className={styles.progressBarBg}>
                          <div
                            className={styles.progressBarFill}
                            style={{ width: `${mastery}%`, backgroundColor: theme.color }}
                          ></div>
                        </div>
                        <div className={styles.revisedNote}>
                          <span className="material-symbols-outlined" style={{ fontSize: '15px' }}>
                            schedule
                          </span>
                          <span>Revised Today</span>
                        </div>
                      </div>

                      <button
                        className={styles.continueCardBtn}
                        onClick={() => navigate(`/subjects/${subjectId}`)}
                      >
                        <span>Continue</span>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                          arrow_forward
                        </span>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* AI Study Insight */}
              <div className={styles.aiInsightBanner}>
                <div className={styles.aiInsightLeft}>
                  <span
                    className={`material-symbols-outlined ${styles.sparklePulseIcon}`}
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                  <div>
                    <h3 className={styles.aiInsightTitle}>AI Study Insight</h3>
                    <p className={styles.aiInsightText}>
                      <strong>Deadlock</strong> is currently your weakest topic in Operating Systems. A
                      short focused revision session could help improve your mastery.
                    </p>
                  </div>
                </div>
                <button
                  className={styles.reviewTopicBtn}
                  onClick={() => navigate('/subjects/dbms/units/normalization/topics/3nf')}
                >
                  <span>Review Topic</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    arrow_forward
                  </span>
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNavBar />

      {/* Modals */}
      <CreateSubjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubjectSubmit}
      />
      <UploadSyllabusModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadComplete={() => fetchSubjects()}
      />
    </div>
  );
};

export default Subjects;
