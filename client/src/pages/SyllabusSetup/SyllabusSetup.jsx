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
                  <div style={{ display: 'inline-flex', padding: '16px', backgroundColor: '#e2dfff', borderRadius: '50%', marginBottom: '16px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '48px', color: '#4441cc', fontVariationSettings: "'FILL' 1" }}>
                      description
                    </span>
                  </div>
                  <h1 className={styles.mainTitle}>Syllabus Uploaded</h1>
                  <p className={styles.subtitle}>
                    Great! Your document is ready for AI analysis. We'll extract the core subjects and topics next.
                  </p>
                </div>

                <div style={{ width: '100%', backgroundColor: '#ffffff', border: '1px solid #c7c4d7', borderRadius: '16px', padding: '24px', boxShadow: '0 8px 24px rgba(0,0,0,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '64px', height: '64px', backgroundColor: '#f0edef', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                      📄
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#1b1b1d' }}>
                        {selectedFile?.name || 'Engineering_Syllabus_2026.pdf'}
                      </h3>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px', fontSize: '13px', color: '#777586' }}>
                        <span>{selectedFile?.size || '2.4 MB'}</span>
                        <span>•</span>
                        <span style={{ color: '#4441cc', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '16px', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                          Ready to analyze
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => { setSelectedFile(null); setActiveStep('step-1-upload'); }}
                    style={{ background: 'transparent', border: 'none', color: '#ba1a1a', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}
                    title="Remove file"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '16px', width: '100%', justifyContent: 'center', marginTop: '16px' }}>
                  <button
                    className={styles.pagePill}
                    style={{ padding: '14px 28px', fontSize: '15px' }}
                    onClick={() => setActiveStep('step-1-upload')}
                  >
                    Choose Another File
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
              <div style={{ width: '100%', backgroundColor: '#ffffff', borderRadius: '20px', padding: '40px', border: '1px solid #c7c4d7', boxShadow: '0 4px 24px rgba(94, 92, 230, 0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '140px', height: '140px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#e2dfff', borderRadius: '50%' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '72px', color: '#4441cc', fontVariationSettings: "'FILL' 1" }}>
                    psychology
                  </span>
                </div>

                <h2 className={styles.mainTitle} style={{ fontSize: '28px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  ReviseAI is reading your syllabus...
                  <span className="material-symbols-outlined" style={{ color: '#00789a', fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                </h2>
                <p className={styles.subtitle} style={{ marginBottom: '32px' }}>
                  We're identifying subjects and organizing your curriculum.
                </p>

                {/* Progress bar */}
                <div style={{ width: '100%', maxWidth: '480px', marginBottom: '32px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 600, color: '#4441cc', marginBottom: '8px' }}>
                    <span>Analysis in progress</span>
                    <span>{analysisProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '12px', backgroundColor: '#c2c1ff', borderRadius: '9999px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${analysisProgress}%`, backgroundColor: '#4441cc', borderRadius: '9999px', transition: 'width 0.5s ease' }}></div>
                  </div>
                </div>

                {/* Processing Steps Box */}
                <div style={{ width: '100%', maxWidth: '480px', backgroundColor: '#f6f3f5', borderRadius: '12px', padding: '24px', border: '1px solid #e4e2e4' }}>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'line-through', color: '#777586' }}>
                      <span className="material-symbols-outlined" style={{ color: '#4441cc', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span>Reading syllabus</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'line-through', color: '#777586' }}>
                      <span className="material-symbols-outlined" style={{ color: '#4441cc', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      <span>Understanding document structure</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#4441cc', fontWeight: 700 }}>
                      <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>radio_button_checked</span>
                      <span>Finding subjects</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.5 }}>
                      <span className="material-symbols-outlined">radio_button_unchecked</span>
                      <span>Organizing curriculum</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'center', gap: '12px', opacity: 0.5 }}>
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

                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {availableSubjects.map((sub) => {
                    const isSelected = selectedSubjects.includes(sub.id);
                    return (
                      <div
                        key={sub.id}
                        onClick={() => toggleSubject(sub.id)}
                        style={{
                          backgroundColor: '#ffffff',
                          border: isSelected ? '2px solid #4441cc' : '1px solid #c7c4d7',
                          borderRadius: '16px',
                          padding: '20px 24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          boxShadow: isSelected ? '0 4px 16px rgba(68, 65, 204, 0.12)' : 'none',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                          <span
                            className="material-symbols-outlined"
                            style={{
                              fontSize: '28px',
                              color: isSelected ? '#4441cc' : '#c7c4d7',
                              fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0",
                            }}
                          >
                            {isSelected ? 'check_box' : 'check_box_outline_blank'}
                          </span>
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#1b1b1d' }}>{sub.title}</h3>
                              <span style={{ fontSize: '12px', fontWeight: 600, backgroundColor: '#f0edef', padding: '2px 8px', borderRadius: '6px', color: '#464554' }}>{sub.code}</span>
                            </div>
                            <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#464554' }}>
                              {sub.topics} Topics • Difficulty: {sub.difficulty}
                            </p>
                          </div>
                        </div>

                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#005e79', backgroundColor: 'rgba(0,94,121,0.1)', padding: '6px 12px', borderRadius: '20px' }}>
                          {sub.coverage} Coverage
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', marginTop: '16px' }}>
                  <button
                    className={styles.pagePill}
                    onClick={() => setSelectedSubjects(availableSubjects.map((s) => s.id))}
                  >
                    Select All ({availableSubjects.length})
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

                <div style={{ width: '100%', backgroundColor: '#ffffff', borderRadius: '20px', padding: '32px', border: '1px solid #c7c4d7', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
                  <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: 700, color: '#4441cc' }}>Workspace Summary</h3>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ backgroundColor: '#f0edef', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '28px', fontWeight: 800, color: '#4441cc' }}>{selectedSubjects.length}</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#464554' }}>Selected Subjects</p>
                    </div>
                    <div style={{ backgroundColor: '#f0edef', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '28px', fontWeight: 800, color: '#9026c3' }}>44</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#464554' }}>Total Topics</p>
                    </div>
                    <div style={{ backgroundColor: '#f0edef', padding: '16px', borderRadius: '12px', textAlign: 'center' }}>
                      <span style={{ fontSize: '28px', fontWeight: 800, color: '#005e79' }}>Ready</span>
                      <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#464554' }}>AI Dataset</p>
                    </div>
                  </div>

                  <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: 700 }}>Included Subjects:</h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {availableSubjects.filter((s) => selectedSubjects.includes(s.id)).map((sub) => (
                      <li key={sub.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 14px', backgroundColor: '#f6f3f5', borderRadius: '8px', fontSize: '14px', fontWeight: 600 }}>
                        <span>{sub.title} ({sub.code})</span>
                        <span style={{ color: '#4441cc' }}>{sub.topics} topics</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  className={styles.chooseFileBtn}
                  style={{ width: '100%', justifyContent: 'center', padding: '16px 32px', fontSize: '18px' }}
                  onClick={() => setActiveStep('step-4-success')}
                >
                  <span className="material-symbols-outlined">task_alt</span>
                  <span>Confirm & Build Dataset</span>
                </button>
              </>
            )}

            {/* PAGE 6: Step 4: Success (Desktop - Light) */}
            {activeStep === 'step-4-success' && (
              <div style={{ width: '100%', backgroundColor: '#ffffff', borderRadius: '24px', padding: '48px', border: '1px solid #c7c4d7', boxShadow: '0 8px 32px rgba(68,65,204,0.12)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '100px', height: '100px', backgroundColor: '#e2dfff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '64px', color: '#4441cc', fontVariationSettings: "'FILL' 1" }}>
                    celebration
                  </span>
                </div>

                <h1 className={styles.mainTitle} style={{ fontSize: '36px', color: '#4441cc' }}>
                  Syllabus Setup Complete! 🎉
                </h1>
                <p className={styles.subtitle} style={{ marginBottom: '32px' }}>
                  Your workspace is fully initialized. ReviseAI has curated your initial topics and generated smart revision cards.
                </p>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '36px' }}>
                  <div style={{ padding: '12px 24px', backgroundColor: '#f0edef', borderRadius: '20px', fontWeight: 700, color: '#4441cc' }}>
                    {selectedSubjects.length} Subjects Added
                  </div>
                  <div style={{ padding: '12px 24px', backgroundColor: '#f0edef', borderRadius: '20px', fontWeight: 700, color: '#005e79' }}>
                    44 Topics Curated
                  </div>
                  <div style={{ padding: '12px 24px', backgroundColor: '#f0edef', borderRadius: '20px', fontWeight: 700, color: '#9026c3' }}>
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
              <div style={{ width: '100%', backgroundColor: '#ffffff', borderRadius: '24px', padding: '48px', border: '2px solid #ffdad6', boxShadow: '0 8px 32px rgba(186,26,26,0.08)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                <div style={{ width: '90px', height: '90px', backgroundColor: '#ffdad6', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '56px', color: '#ba1a1a' }}>
                    error
                  </span>
                </div>

                <h1 className={styles.mainTitle} style={{ fontSize: '28px', color: '#ba1a1a' }}>
                  Unable to Process Syllabus
                </h1>
                <p className={styles.subtitle} style={{ marginBottom: '32px', maxWidth: '520px' }}>
                  We couldn't extract subjects from the uploaded file. Please ensure the file is unencrypted and contains clear syllabus text.
                </p>

                <div style={{ display: 'flex', gap: '16px' }}>
                  <button
                    className={styles.pagePill}
                    style={{ padding: '14px 28px', fontSize: '15px' }}
                    onClick={() => setActiveStep('step-1-upload')}
                  >
                    Upload Different File
                  </button>
                  <button
                    className={styles.chooseFileBtn}
                    style={{ backgroundColor: '#ba1a1a', borderBottomColor: '#93000a' }}
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
