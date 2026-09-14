import React, { useState, useEffect, useRef } from 'react';
import styles from './MaterialList.module.css';

const MaterialList = ({ subjectId, unitId, topicId }) => {
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(null);
  const [isRetrying, setIsRetrying] = useState(null);
  const pollTimerRef = useRef(null);

  // Fetch materials whenever component mounts or dependencies change
  const fetchMaterials = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError('');
    try {
      let url = `/api/materials/subject/${subjectId}?`;
      if (unitId) url += `unitId=${unitId}&`;
      if (topicId) url += `topicId=${topicId}`;

      const response = await fetch(url, {
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch materials');
      }

      setMaterials(data.materials || []);
    } catch (err) {
      setError(err.message || 'Error loading materials');
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials(true);

    const handleUploaded = () => fetchMaterials(false);
    window.addEventListener('materialUploaded', handleUploaded);

    return () => {
      window.removeEventListener('materialUploaded', handleUploaded);
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
      }
    };
  }, [subjectId, unitId, topicId]);

  // Auto-poll materials list if any material is in progress ('uploaded' or 'processing')
  useEffect(() => {
    const hasPending = materials.some(
      (m) => m.processingStatus === 'uploaded' || m.processingStatus === 'processing'
    );

    if (hasPending) {
      if (!pollTimerRef.current) {
        pollTimerRef.current = setInterval(() => {
          fetchMaterials(false);
        }, 3000);
      }
    } else {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    }

    return () => {
      if (pollTimerRef.current && !hasPending) {
        clearInterval(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };
  }, [materials]);

  const handleDelete = async (materialId) => {
    if (!window.confirm('Are you sure you want to delete this material?')) return;

    setIsDeleting(materialId);
    try {
      const response = await fetch(`/api/materials/${materialId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete material');
      }

      setMaterials(materials.filter((m) => m._id !== materialId));
    } catch (err) {
      alert(err.message || 'Error deleting material');
    } finally {
      setIsDeleting(null);
    }
  };

  const handleRetry = async (materialId) => {
    setIsRetrying(materialId);
    try {
      const response = await fetch(`/api/materials/${materialId}/retry`, {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Failed to trigger retry processing');
      }

      // Optimistically update material status in state
      setMaterials((prev) =>
        prev.map((m) =>
          m._id === materialId
            ? { ...m, processingStatus: 'processing', processingProgress: 10, processingError: undefined }
            : m
        )
      );

      // Trigger immediate fetch
      fetchMaterials(false);
    } catch (err) {
      alert(err.message || 'Error retrying material processing');
    } finally {
      setIsRetrying(null);
    }
  };

  const getFileIcon = (fileType) => {
    if (fileType?.includes('pdf')) return 'picture_as_pdf';
    if (fileType?.includes('word') || fileType?.includes('docx')) return 'description';
    return 'article';
  };

  // Determine stage active/complete status for 4-stage pipeline
  const getStageStatus = (status, progress, stageIndex) => {
    if (status === 'completed') return 'completed';
    if (status === 'failed') return 'failed';
    
    // Stage 0: File uploaded (always completed once created)
    if (stageIndex === 0) return 'completed';

    // Stage 1: Text extraction (progress 10% -> 40%)
    if (stageIndex === 1) {
      if (progress > 40) return 'completed';
      if (progress >= 10) return 'active';
      return 'pending';
    }

    // Stage 2: Preparing content (progress 40% -> 70%)
    if (stageIndex === 2) {
      if (progress > 70) return 'completed';
      if (progress >= 40) return 'active';
      return 'pending';
    }

    // Stage 3: Finalizing (progress 70% -> 100%)
    if (stageIndex === 3) {
      if (progress >= 100) return 'completed';
      if (progress >= 70) return 'active';
      return 'pending';
    }

    return 'pending';
  };

  const stages = [
    { title: 'File uploaded', short: 'Uploaded' },
    { title: 'Text extraction', short: 'Extraction' },
    { title: 'Preparing content', short: 'Preparing' },
    { title: 'Finalizing', short: 'Finalizing' },
  ];

  const renderStatusSection = (material) => {
    const status = material.processingStatus || 'uploaded';
    const progress = material.processingProgress || 0;

    if (status === 'completed') {
      return (
        <div className={styles.statusSuccessContainer}>
          <div className={styles.statusSuccessHeader}>
            <div className={styles.badgeSuccess}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px', fontVariationSettings: "'FILL' 1" }}>
                check_circle
              </span>
              <span>Completed</span>
            </div>
            <span className={styles.statusSuccessMsg}>Document processed successfully!</span>
          </div>
          <p className={styles.statusSuccessSubtext}>
            Ready for ReviseAI learning & knowledge base integration.
          </p>
        </div>
      );
    }

    if (status === 'failed') {
      return (
        <div className={styles.statusFailedContainer}>
          <div className={styles.failedHeaderRow}>
            <div className={styles.badgeFailed}>
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                error
              </span>
              <span>Failed</span>
            </div>
            <span className={styles.failedPrimaryTitle}>We couldn't process this document.</span>
          </div>
          <p className={styles.errorMessage} title={material.processingError}>
            {material.processingError || 'An unexpected error occurred during extraction or chunking.'}
          </p>
          <div className={styles.failedActionRow}>
            <button
              className={styles.retryBtn}
              onClick={() => handleRetry(material._id)}
              disabled={isRetrying === material._id}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                {isRetrying === material._id ? 'hourglass_top' : 'refresh'}
              </span>
              <span>{isRetrying === material._id ? 'Retrying...' : 'Retry'}</span>
            </button>
          </div>
        </div>
      );
    }

    // Status: uploaded or processing
    return (
      <div className={styles.statusProcessingContainer}>
        <div className={styles.processingHeader}>
          <div className={styles.badgeProcessing}>
            <span className={styles.pulseDot}></span>
            <span>Processing</span>
          </div>
          <span className={styles.progressPercent}>{progress}%</span>
        </div>

        <p className={styles.processingBannerText}>
          Processing your document... We're extracting and preparing your content for ReviseAI.
        </p>

        {/* 4-Stage Progress Stepper */}
        <div className={styles.stageStepper}>
          {stages.map((stage, idx) => {
            const stageState = getStageStatus(status, progress, idx);
            return (
              <div key={idx} className={`${styles.stageStep} ${styles[`stage_${stageState}`]}`}>
                <div className={styles.stageIconWrapper}>
                  {stageState === 'completed' ? (
                    <span className="material-symbols-outlined" style={{ fontSize: '12px' }}>
                      check
                    </span>
                  ) : stageState === 'active' ? (
                    <div className={styles.stageActiveDot}></div>
                  ) : (
                    <div className={styles.stagePendingDot}></div>
                  )}
                </div>
                <span className={styles.stageLabel}>{stage.title}</span>
              </div>
            );
          })}
        </div>

        {/* Progress Bar Track */}
        <div className={styles.progressBarTrack}>
          <div className={styles.progressBarFill} style={{ width: `${Math.max(progress, 8)}%` }} />
        </div>

        {/* Reassurance UX message */}
        <p className={styles.reassuranceNote}>
          <span className="material-symbols-outlined" style={{ fontSize: '13px' }}>
            info
          </span>
          <span>Your document is being processed. This may take a little while. You can leave this page and come back later.</span>
        </p>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading study materials...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
          warning
        </span>
        <p>{error}</p>
        <button className={styles.retryBtn} onClick={() => fetchMaterials(true)}>
          <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
            refresh
          </span>
          <span>Retry Loading</span>
        </button>
      </div>
    );
  }

  if (materials.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIconBox}>
          <span className="material-symbols-outlined" style={{ fontSize: '36px' }}>
            folder_open
          </span>
        </div>
        <h4 className={styles.emptyTitle}>No study materials uploaded yet</h4>
        <p className={styles.emptySubtitle}>
          Upload lecture notes, textbooks, or reference PDFs to start document processing.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      <div className={styles.listHeaderRow}>
        <h3 className={styles.listHeading}>Study Materials ({materials.length})</h3>
      </div>
      <div className={styles.materialsGrid}>
        {materials.map((material) => (
          <div key={material._id} className={styles.materialCard}>
            <div className={styles.materialMainInfo}>
              <div className={styles.materialIcon}>
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>
                  {getFileIcon(material.fileType)}
                </span>
              </div>
              <div className={styles.materialDetails}>
                <h4 className={styles.materialTitle} title={material.title}>
                  {material.title}
                </h4>
                <p className={styles.materialMeta}>
                  {material.fileName} • {new Date(material.createdAt).toLocaleDateString()} •{' '}
                  {(material.fileSize / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <div className={styles.materialActions}>
                {material.fileUrl && (
                  <a
                    href={material.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.actionBtn}
                    title="View Original File"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                      open_in_new
                    </span>
                  </a>
                )}
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(material._id)}
                  disabled={isDeleting === material._id}
                  title="Delete Material"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {isDeleting === material._id ? 'hourglass_bottom' : 'delete'}
                  </span>
                </button>
              </div>
            </div>

            <div className={styles.statusSection}>{renderStatusSection(material)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialList;
