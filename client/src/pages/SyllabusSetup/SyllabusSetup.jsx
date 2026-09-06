import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './SyllabusSetup.module.css';

const SyllabusSetup = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Active step state corresponding to the 7 Stitch design screens
  // 'step-1-upload' | 'step-1-selected' | 'step-2-analysis' | 'step-3-subjects' | 'step-4-review' | 'step-4-success' | 'error-state'
  const [activeStep, setActiveStep] = useState('step-1-upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(72);
  const [selectedSubjects, setSelectedSubjects] = useState(['dbms', 'cn', 'os', 'se']);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setActiveStep('step-1-selected');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      setSelectedFile(file);
      setActiveStep('step-1-selected');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleChooseFileClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Mock subject dataset matching Stitch design
  const availableSubjects = [
    { id: 'dbms', title: 'Database Management Systems', code: 'CS301', topics: 12, difficulty: 'Medium', coverage: '85%' },
    { id: 'cn', title: 'Computer Networks', code: 'CS302', topics: 14, difficulty: 'Hard', coverage: '90%' },
    { id: 'os', title: 'Operating Systems', code: 'CS303', topics: 10, difficulty: 'Medium', coverage: '80%' },
    { id: 'se', title: 'Software Engineering', code: 'CS304', topics: 8, difficulty: 'Easy', coverage: '75%' },
  ];

  const toggleSubject = (id) => {
    setSelectedSubjects((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Step indicator mapping
  const getStepProgress = () => {
    switch (activeStep) {
      case 'step-1-upload':
      case 'step-1-selected':
        return 25;
      case 'step-2-analysis':
        return 50;
      case 'step-3-subjects':
        return 75;
      case 'step-4-review':
      case 'step-4-success':
        return 100;
      default:
        return 25;
    }
  };

  return (
    <div className={styles.container}>
      {/* Top Header Bar */}
      <header className={styles.topHeader}>
        <div className={styles.brandGroup} onClick={() => navigate('/home')}>
          <span className="material-symbols-outlined" style={{ color: '#4441cc', fontVariationSettings: "'FILL' 1", fontSize: '28px' }}>
            auto_awesome
          </span>
          <span className={styles.brandTitle}>ReviseAI</span>
        </div>
        <span className={styles.headerTitle}>Set up your learning space</span>
        <div className={styles.headerActions}>
          <button className={styles.iconBtn} aria-label="Help" title="Help">
            <span className="material-symbols-outlined">help</span>
          </button>
          <button className={styles.iconBtn} onClick={() => navigate('/settings')} aria-label="Account" title="Account">
            <span className="material-symbols-outlined">account_circle</span>
          </button>
        </div>
      </header>

      {/* Main Body Layout */}
      <div className={styles.bodyLayout}>
        {/* Sidebar Navigation */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h2 className={styles.sidebarTitle}>Onboarding</h2>
            <p className={styles.sidebarStepLabel}>
              {activeStep.startsWith('step-1') && 'Step 1 of 4'}
              {activeStep === 'step-2-analysis' && 'Step 2 of 4'}
              {activeStep === 'step-3-subjects' && 'Step 3 of 4'}
              {activeStep.startsWith('step-4') && 'Step 4 of 4'}
              {activeStep === 'error-state' && 'Error State'}
            </p>
            <div className={styles.sidebarProgressBarTrack}>
              <div
                className={styles.sidebarProgressBarFill}
                style={{ width: `${getStepProgress()}%` }}
              ></div>
            </div>
          </div>

          <ul className={styles.navList}>
            <li>
              <button
                className={`${styles.navItem} ${activeStep.startsWith('step-1') ? styles.navItemActive : activeStep !== 'error-state' ? styles.navItemCompleted : ''}`}
                onClick={() => setActiveStep('step-1-upload')}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {activeStep === 'step-1-upload' || activeStep === 'step-1-selected' ? 'upload_file' : 'check_circle'}
                </span>
                <span>Upload Syllabus</span>
              </button>
            </li>
            <li>
              <button
                className={`${styles.navItem} ${activeStep === 'step-2-analysis' ? styles.navItemActive : activeStep === 'step-3-subjects' || activeStep.startsWith('step-4') ? styles.navItemCompleted : ''}`}
                onClick={() => setActiveStep('step-2-analysis')}
              >
                <span className="material-symbols-outlined">analytics</span>
                <span>Analyze Syllabus</span>
              </button>
            </li>
            <li>
              <button
                className={`${styles.navItem} ${activeStep === 'step-3-subjects' ? styles.navItemActive : activeStep.startsWith('step-4') ? styles.navItemCompleted : ''}`}
                onClick={() => setActiveStep('step-3-subjects')}
              >
                <span className="material-symbols-outlined">checklist</span>
                <span>Select Subjects</span>
              </button>
            </li>
            <li>
              <button
                className={`${styles.navItem} ${activeStep.startsWith('step-4') ? styles.navItemActive : ''}`}
                onClick={() => setActiveStep('step-4-review')}
              >
                <span className="material-symbols-outlined">database</span>
                <span>Create Dataset</span>
              </button>
            </li>
          </ul>
        </aside>

        {/* Main Content Workspace */}
        <main className={styles.mainContent}>
          {/* Quick Page Switcher Bar for Review & Testing */}
          <div className={styles.pageSelectorBar}>
            <span className={styles.pageSelectorTitle}>Switch Screen View:</span>
            <div className={styles.pageSelectorPills}>
              <button
                className={`${styles.pagePill} ${activeStep === 'step-1-upload' ? styles.pagePillActive : ''}`}
                onClick={() => setActiveStep('step-1-upload')}
              >
                1. Upload
              </button>
              <button
                className={`${styles.pagePill} ${activeStep === 'step-1-selected' ? styles.pagePillActive : ''}`}
                onClick={() => {
                  setSelectedFile({ name: 'Engineering_Syllabus_2026.pdf', size: '2.4 MB' });
                  setActiveStep('step-1-selected');
                }}
              >
                2. File Selected
              </button>
              <button
                className={`${styles.pagePill} ${activeStep === 'step-2-analysis' ? styles.pagePillActive : ''}`}
                onClick={() => setActiveStep('step-2-analysis')}
              >
                3. AI Analysis
              </button>
              <button
                className={`${styles.pagePill} ${activeStep === 'step-3-subjects' ? styles.pagePillActive : ''}`}
                onClick={() => setActiveStep('step-3-subjects')}
              >
                4. Select Subjects
              </button>
              <button
                className={`${styles.pagePill} ${activeStep === 'step-4-review' ? styles.pagePillActive : ''}`}
                onClick={() => setActiveStep('step-4-review')}
              >
                5. Review
              </button>
              <button
                className={`${styles.pagePill} ${activeStep === 'step-4-success' ? styles.pagePillActive : ''}`}
                onClick={() => setActiveStep('step-4-success')}
              >
                6. Success
              </button>
              <button
                className={`${styles.pagePill} ${activeStep === 'error-state' ? styles.pagePillActive : ''}`}
                onClick={() => setActiveStep('error-state')}
              >
                7. Error State
              </button>
            </div>
          </div>

          <div className={styles.contentWrapper}>
            {/* PAGE 1: Step 1: Upload (Desktop - Light) */}
            {activeStep === 'step-1-upload' && (
              <>
                <div className={styles.pageHeader}>
                  <h1 className={styles.mainTitle}>Let's start with your syllabus 📚</h1>
                  <p className={styles.subtitle}>
                    Upload your syllabus and ReviseAI will automatically find the subjects you can study.
                  </p>
                </div>

                <div
                  className={styles.uploadCard}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={handleChooseFileClick}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className={styles.hiddenFileInput}
                    onChange={handleFileSelect}
                    accept=".pdf,.docx,.pptx"
                  />
                  <div className={styles.illustrationBox}>
                    <span className="material-symbols-outlined" style={{ fontSize: '96px', color: '#4441cc' }}>
                      upload_file
                    </span>
                  </div>
                  <h3 className={styles.dropTitle}>Drag & drop your syllabus here</h3>
                  <p className={styles.dropSubtitle}>or choose a file from your device</p>

                  <button className={styles.chooseFileBtn} onClick={(e) => { e.stopPropagation(); handleChooseFileClick(); }}>
                    <span className="material-symbols-outlined">upload_file</span>
                    <span>Choose File</span>
                  </button>

                  <p className={styles.formatNote}>Supported formats: PDF, DOCX, PPTX (Max 10MB)</p>
                </div>
              </>
            )}

            {/* PAGE 2: Step 1: File Selected (Desktop - Light) */}
            {activeStep === 'step-1-selected' && (
              <>
                <div className={styles.pageHeader}>
                  <div className={styles.fileSelectedIconWrapper}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#4441cc', fontVariationSettings: "'FILL' 1" }}>
                      description
                    </span>
                  </div>
                  <h1 className={styles.mainTitle}>Syllabus Uploaded</h1>
                  <p className={styles.subtitle}>
                    Great! Your document is ready for AI analysis. We'll extract the core subjects and topics next.
                  </p>
                </div>

                <div className={styles.fileCard}>
                  <div className={styles.fileCardLeft}>
                    <div className={styles.fileIconBox}>
                      📄
                    </div>
                    <div>
                      <h3 className={styles.fileName}>
                        {selectedFile?.name || 'Engineering_Syllabus_2026.pdf'}
                      </h3>
                      <div className={styles.fileMetaRow}>
                        <span>{selectedFile?.size || '2.4 MB'}</span>
                        <span>•</span>
                        <span className={styles.readyBadge}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          Ready to analyze
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    className={styles.removeFileBtn}
                    onClick={() => { setSelectedFile(null); setActiveStep('step-1-upload'); }}
                    title="Remove file"
                    aria-label="Remove file"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div className={styles.actionGroup}>
                  <button
                    className={styles.secondaryActionBtn}
                    onClick={() => setActiveStep('step-1-upload')}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>upload</span>
                    <span>Choose Another File</span>
                  </button>
                  <button
                    className={styles.chooseFileBtn}
                    onClick={() => setActiveStep('step-2-analysis')}
                  >
                    <span className="material-symbols-outlined">auto_awesome</span>
                    <span>Analyze Syllabus →</span>
                  </button>
                </div>
              </>
            )}

            {/* PAGE 3: Step 2: AI Analysis (Desktop - Light) */}
            {activeStep === 'step-2-analysis' && (
              <div className={styles.aiAnalysisCard}>
                <div className={styles.aiVisualCircle}>
                  <span className="material-symbols-outlined" style={{ fontSize: '72px', color: '#4441cc', fontVariationSettings: "'FILL' 1" }}>
                    psychology
                  </span>
                </div>

                <h2 className={styles.aiHeadingRow}>
                  <span>ReviseAI is reading your syllabus...</span>
                  <span className={`material-symbols-outlined ${styles.pulseSparkle}`} style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </h2>
                <p className={styles.subtitle} style={{ marginBottom: '32px' }}>
                  We're identifying subjects and organizing your curriculum.
                </p>

                {/* Progress bar */}
                <div className={styles.progressSection}>
                  <div className={styles.progressHeader}>
                    <span>Analysis in progress</span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <div className={styles.progressBarTrack}>
                    <div className={styles.progressBarFillGradient} style={{ width: `${analysisProgress}%` }}></div>
                  </div>
                </div>

                {/* Processing Steps Box */}
                <div className={styles.stepsBox}>
                  <ul className={styles.stepsList}>
                    <li className={styles.stepCompleted}>
                      <span className="material-symbols-outlined" style={{ color: '#4441cc', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span>Reading syllabus</span>
                    </li>
                    <li className={styles.stepCompleted}>
                      <span className="material-symbols-outlined" style={{ color: '#4441cc', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span>Understanding document structure</span>
                    </li>
                    <li className={styles.stepActive}>
                      <span className={`material-symbols-outlined ${styles.pulseSparkle}`} style={{ fontVariationSettings: "'FILL' 1" }}>radio_button_checked</span>
                      <span>Finding subjects</span>
                    </li>
                    <li className={styles.stepPending}>
                      <span className="material-symbols-outlined">radio_button_unchecked</span>
                      <span>Organizing curriculum</span>
                    </li>
                    <li className={styles.stepPending}>
                      <span className="material-symbols-outlined">radio_button_unchecked</span>
                      <span>Preparing your subject list</span>
                    </li>
                  </ul>
                </div>

                <button
                  className={styles.chooseFileBtn}
                  style={{ marginTop: '32px' }}
                  onClick={() => setActiveStep('step-3-subjects')}
                >
                  <span>Continue to Select Subjects →</span>
                </button>
              </div>
            )}

            {/* PAGE 4: Step 3: Select Subjects (Desktop - Light) */}
            {activeStep === 'step-3-subjects' && (
              <>
                <div className={styles.pageHeader}>
                  <h1 className={styles.mainTitle}>Select Your Subjects 📋</h1>
                  <p className={styles.subtitle}>
                    We found 4 subjects in your syllabus. Choose which subjects you want to add to your ReviseAI workspace.
                  </p>
                </div>

                <div className={styles.subjectSelectionList}>
                  {availableSubjects.map((sub) => {
                    const isSelected = selectedSubjects.includes(sub.id);
                    return (
                      <div
                        key={sub.id}
                        onClick={() => toggleSubject(sub.id)}
                        className={`${styles.subjectCardItem} ${isSelected ? styles.subjectCardItemSelected : ''}`}
                      >
                        <div className={styles.subjectLeftGroup}>
                          <span
                            className={`material-symbols-outlined ${styles.checkboxIcon} ${isSelected ? styles.checkboxIconSelected : ''}`}
                            style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
                          >
                            {isSelected ? 'check_box' : 'check_box_outline_blank'}
                          </span>
                          <div>
                            <div className={styles.subjectTitleRow}>
                              <h3 className={styles.subjectTitleText}>{sub.title}</h3>
                              <span className={styles.subjectCodeBadge}>{sub.code}</span>
                            </div>
                            <p className={styles.subjectMetaText}>
                              {sub.topics} Topics • Difficulty: {sub.difficulty}
                            </p>
                          </div>
                        </div>

                        <span className={styles.coverageBadge}>
                          {sub.coverage} Coverage
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.subjectActionRow}>
                  <button
                    className={styles.pagePill}
                    onClick={() =>
                      setSelectedSubjects((prev) =>
                        prev.length === availableSubjects.length ? [] : availableSubjects.map((s) => s.id)
                      )
                    }
                  >
                    {selectedSubjects.length === availableSubjects.length ? 'Deselect All' : `Select All (${availableSubjects.length})`}
                  </button>
                  <button
                    className={styles.chooseFileBtn}
                    onClick={() => setActiveStep('step-4-review')}
                    disabled={selectedSubjects.length === 0}
                  >
                    <span>Continue to Review ({selectedSubjects.length}) →</span>
                  </button>
                </div>
              </>
            )}

            {/* PAGE 5: Step 4: Review (Desktop - Light) */}
            {activeStep === 'step-4-review' && (
              <>
                <div className={styles.pageHeader}>
                  <h1 className={styles.mainTitle}>Review & Confirm 🚀</h1>
                  <p className={styles.subtitle}>
                    Confirm your selection before building your AI learning dataset.
                  </p>
                </div>

                <div className={styles.reviewCard}>
                  <h3 className={styles.reviewTitle}>Workspace Summary</h3>

                  <div className={styles.reviewMetricsGrid}>
                    <div className={styles.metricBox}>
                      <span className={styles.metricNumberPrimary}>{selectedSubjects.length}</span>
                      <p className={styles.metricLabel}>Selected Subjects</p>
                    </div>
                    <div className={styles.metricBox}>
                      <span className={styles.metricNumberPurple}>44</span>
                      <p className={styles.metricLabel}>Total Topics</p>
                    </div>
                    <div className={styles.metricBox}>
                      <span className={styles.metricNumberCyan}>Ready</span>
                      <p className={styles.metricLabel}>AI Dataset</p>
                    </div>
                  </div>

                  <h4 className={styles.includedSubjectsHeading}>Included Subjects:</h4>
                  <ul className={styles.includedSubjectsList}>
                    {availableSubjects.filter((s) => selectedSubjects.includes(s.id)).map((sub) => (
                      <li key={sub.id} className={styles.includedSubjectRow}>
                        <span>{sub.title} ({sub.code})</span>
                        <span style={{ color: '#4441cc' }}>{sub.topics} topics</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className={`${styles.chooseFileBtn} ${styles.confirmBtn}`}
                  onClick={() => setActiveStep('step-4-success')}
                >
                  <span className="material-symbols-outlined">task_alt</span>
                  <span>Confirm & Build Dataset</span>
                </button>
              </>
            )}

            {/* PAGE 6: Step 4: Success (Desktop - Light) */}
            {activeStep === 'step-4-success' && (
              <div className={styles.successCard}>
                <div className={styles.celebrationCircle}>
                  <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#4441cc', fontVariationSettings: "'FILL' 1" }}>
                    celebration
                  </span>
                </div>

                <h1 className={styles.successTitle}>
                  Syllabus Setup Complete! 🎉
                </h1>
                <p className={styles.subtitle} style={{ marginBottom: '32px' }}>
                  Your workspace is fully initialized. ReviseAI has curated your initial topics and generated smart revision cards.
                </p>

                <div className={styles.chipsRow}>
                  <div className={styles.chipPrimary}>
                    {selectedSubjects.length} Subjects Added
                  </div>
                  <div className={styles.chipCyan}>
                    44 Topics Curated
                  </div>
                  <div className={styles.chipPurple}>
                    Level 1 Unlocked
                  </div>
                </div>

                <button
                  className={styles.chooseFileBtn}
                  style={{ padding: '16px 40px', fontSize: '18px' }}
                  onClick={() => navigate('/home')}
                >
                  <span>Go to Home Dashboard →</span>
                </button>
              </div>
            )}

            {/* PAGE 7: Error State (Desktop - Light) */}
            {activeStep === 'error-state' && (
              <div className={styles.errorCard}>
                <div className={styles.errorCircle}>
                  <span className="material-symbols-outlined" style={{ fontSize: '56px', color: '#ba1a1a' }}>
                    error
                  </span>
                </div>

                <h1 className={styles.errorTitle}>
                  Unable to Process Syllabus
                </h1>
                <p className={styles.subtitle} style={{ marginBottom: '32px', maxWidth: '520px' }}>
                  We couldn't extract subjects from the uploaded file. Please ensure the file is unencrypted and contains clear syllabus text.
                </p>

                <div className={styles.errorActionGroup}>
                  <button
                    className={styles.secondaryActionBtn}
                    onClick={() => setActiveStep('step-1-upload')}
                  >
                    Upload Different File
                  </button>
                  <button
                    className={`${styles.chooseFileBtn} ${styles.errorRetryBtn}`}
                    onClick={() => setActiveStep('step-1-upload')}
                  >
                    <span className="material-symbols-outlined">refresh</span>
                    <span>Try Again</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SyllabusSetup;
