import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UploadSyllabusModal.module.css';

/**
 * UploadSyllabusModal handles:
 * - Task 9: Upload - Select Files
 * - Task 10: Upload - AI Analysis State
 * - Task 11: Upload - Success State
 * - Task 16: Mobile responsiveness
 */
const UploadSyllabusModal = ({ isOpen, onClose, onUploadComplete, initialSubjectId = '' }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // States: 'select' | 'analyzing' | 'success' | 'error'
  const [modalState, setModalState] = useState('select');
  const [selectedFile, setSelectedFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('Reading syllabus and document structure...');
  const [extractedTopics, setExtractedTopics] = useState([
    'Normalization (1NF, 2NF, 3NF)',
    'Concurrency Control Protocols',
    'ACID Properties in Transactions',
  ]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setModalState('select');
      setSelectedFile(null);
      setProgress(0);
      setErrorMessage('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleDragEnter = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file) => {
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const fileName = file.name.toLowerCase();
    const isValidExt = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExt) {
      alert('Please upload a supported format: PDF, DOCX, or TXT.');
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('Maximum file size is 50MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const analysisTimersRef = useRef([]);

  // Start AI analysis simulation / backend trigger
  const handleStartAnalysis = () => {
    if (!selectedFile) return;

    setModalState('analyzing');
    setProgress(15);
    setStatusMessage('Reading syllabus document...');

    const timer1 = setTimeout(() => {
      setProgress(45);
      setStatusMessage('Analyzing syllabus and identifying academic subjects...');
    }, 1200);

    const timer2 = setTimeout(() => {
      setProgress(75);
      setStatusMessage('Extracting units, topics, and core learning modules...');
    }, 2400);

    const timer3 = setTimeout(() => {
      setProgress(100);
      setStatusMessage('Finalizing structure and building subject dataset...');
      setTimeout(() => {
        setModalState('success');
        if (onUploadComplete) {
          onUploadComplete({
            fileName: selectedFile.name,
            topics: extractedTopics,
          });
        }
      }, 800);
    }, 3800);

    analysisTimersRef.current = [timer1, timer2, timer3];
  };

  const handleCancelAnalysis = () => {
    analysisTimersRef.current.forEach(clearTimeout);
    setModalState('select');
    setProgress(0);
  };

  const handleGoToWorkspace = () => {
    onClose();
    if (initialSubjectId) {
      navigate(`/subjects/${initialSubjectId}`);
    } else {
      navigate('/subjects');
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Top AI Glow Border */}
        <div className={styles.aiGlowTopBorder}></div>

        {/* Modal Header */}
        {modalState === 'select' && (
          <div className={styles.modalHeader}>
            <div className={styles.headerLeft}>
              <div className={styles.headerIcon}>
                <span className="material-symbols-outlined">upload_file</span>
              </div>
              <h2 className={styles.modalTitle}>Upload Study Material</h2>
            </div>
            <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {/* STATE 1: SELECT FILES (TASK 9) */}
          {modalState === 'select' && (
            <>
              {!selectedFile ? (
                <div
                  className={`${styles.dropZone} ${isDragOver ? styles.dropZoneActive : ''}`}
                  onDragEnter={handleDragEnter}
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={handleBrowseClick}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className={styles.hiddenInput}
                    onChange={handleFileChange}
                    accept=".pdf,.docx,.txt"
                  />
                  <span className={`material-symbols-outlined ${styles.dropSparkle}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                  <div className={styles.dropIconBox}>
                    <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                      cloud_upload
                    </span>
                  </div>
                  <h3 className={styles.dropTitle}>Drag & drop files here</h3>
                  <p className={styles.dropSubtitle}>
                    Upload your lectures, notes, or textbooks to let ReviseAI generate insights.
                  </p>
                  <button
                    type="button"
                    className={styles.browseBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBrowseClick();
                    }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      folder_open
                    </span>
                    Browse Files
                  </button>
                </div>
              ) : (
                <div className={styles.selectedFileCard}>
                  <div className={styles.fileInfoLeft}>
                    <div className={styles.fileBadge}>
                      <span className="material-symbols-outlined">description</span>
                    </div>
                    <div>
                      <h4 className={styles.fileName}>{selectedFile.name}</h4>
                      <p className={styles.fileSize}>{formatFileSize(selectedFile.size)}</p>
                    </div>
                  </div>
                  <button
                    className={styles.removeFileBtn}
                    onClick={handleRemoveFile}
                    title="Remove file"
                    aria-label="Remove file"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              )}

              {/* Supported Formats Info */}
              <div className={styles.formatsRow}>
                <span className={styles.formatItem}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#005e79' }}>
                    picture_as_pdf
                  </span>
                  PDF
                </span>
                <span className={styles.formatDot}></span>
                <span className={styles.formatItem}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#4441cc' }}>
                    description
                  </span>
                  DOCX
                </span>
                <span className={styles.formatDot}></span>
                <span className={styles.formatItem}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: '#777586' }}>
                    article
                  </span>
                  TXT
                </span>
              </div>
              <div className={styles.maxSizeNote}>Maximum file size: 50MB</div>
            </>
          )}

          {/* STATE 2: AI ANALYSIS STATE (TASK 10) */}
          {modalState === 'analyzing' && (
            <div className={styles.analysisContainer}>
              <div className={styles.aiPulseWrapper}>
                <div className={styles.aiPulseRing}></div>
                <div className={styles.aiIconCore}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    description
                  </span>
                </div>
                <div className={styles.sparkleFloat}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                </div>
              </div>

              <h3 className={styles.analysisTitle}>Analyzing...</h3>
              <p className={styles.analysisFileName}>{selectedFile?.name || 'Syllabus_Document.pdf'}</p>

              {/* Progress bar */}
              <div className={styles.progressContainer}>
                <div className={styles.progressLabelRow}>
                  <span>Progress</span>
                  <span style={{ color: '#4441cc', fontWeight: 700 }}>{progress}%</span>
                </div>
                <div className={styles.progressTrack}>
                  <div className={styles.progressFill} style={{ width: `${progress}%` }}></div>
                </div>
              </div>

              {/* AI Status Messaging */}
              <div className={styles.aiMessageCard}>
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                  tips_and_updates
                </span>
                <p>{statusMessage}</p>
              </div>

              <button className={styles.cancelAnalysisBtn} onClick={handleCancelAnalysis}>
                Cancel
              </button>
            </div>
          )}

          {/* STATE 3: SUCCESS STATE (TASK 11) */}
          {modalState === 'success' && (
            <div className={styles.successContainer}>
              <div className={styles.celebratoryIconWrapper}>
                <div className={styles.celebratoryGlow}></div>
                <div className={styles.celebratoryCore}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1", fontSize: '40px' }}>
                    check_circle
                  </span>
                </div>
                <span className={`material-symbols-outlined ${styles.sparkle1}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                <span className={`material-symbols-outlined ${styles.sparkle2}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
                <span className={`material-symbols-outlined ${styles.sparkle3}`} style={{ fontVariationSettings: "'FILL' 1" }}>
                  auto_awesome
                </span>
              </div>

              <h3 className={styles.successTitle}>Success!</h3>
              <p className={styles.successSubtitle}>
                We've successfully processed your material and extracted{' '}
                <strong style={{ color: '#5e5ce6' }}>3 new topics</strong> for your Syllabus.
              </p>

              <div className={styles.topicsPreviewBox}>
                <div className={styles.previewHeader}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    auto_awesome
                  </span>
                  <span>New Topics Extracted</span>
                </div>
                <ul className={styles.extractedList}>
                  {extractedTopics.map((topic, i) => (
                    <li key={i} className={styles.extractedItem}>
                      <span className="material-symbols-outlined">menu_book</span>
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.successActionsRow}>
                <button
                  className={styles.uploadMoreBtn}
                  onClick={() => {
                    setSelectedFile(null);
                    setModalState('select');
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    upload
                  </span>
                  <span>Upload More</span>
                </button>
                <button className={styles.goToWorkspaceBtn} onClick={handleGoToWorkspace}>
                  <span>Go to Workspace</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    arrow_forward
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer (for Select state) */}
        {modalState === 'select' && (
          <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              className={styles.primaryActionBtn}
              onClick={handleStartAnalysis}
              disabled={!selectedFile}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                auto_awesome
              </span>
              <span>Analyze Syllabus</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadSyllabusModal;
