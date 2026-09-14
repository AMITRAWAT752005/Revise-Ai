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
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('docx')) return '📝';
    return '📃';
  };

  const renderStatusBadge = (material) => {
    const status = material.processingStatus || 'uploaded';
    const progress = material.processingProgress || 0;

    if (status === 'completed') {
      return (
        <div className={styles.statusSuccess}>
          <span className={styles.badgeSuccess}>Completed</span>
          <span className={styles.statusMessage}>Document processed successfully.</span>
        </div>
      );
    }

    if (status === 'failed') {
      return (
        <div className={styles.statusFailedContainer}>
          <span className={styles.badgeFailed}>Failed</span>
          <span className={styles.errorMessage} title={material.processingError}>
            Document processing failed: {material.processingError || 'Unknown error'}
          </span>
          <button
            className={styles.retryBtn}
            onClick={() => handleRetry(material._id)}
            disabled={isRetrying === material._id}
          >
            {isRetrying === material._id ? 'Retrying...' : '🔄 Retry'}
          </button>
        </div>
      );
    }

    if (status === 'processing') {
      const stepText = progress <= 30 ? 'Extracting text...' : 'Preparing content...';
      return (
        <div className={styles.statusProcessingContainer}>
          <div className={styles.processingHeader}>
            <span className={styles.badgeProcessing}>Processing</span>
            <span className={styles.stepText}>{stepText} ({progress}%)</span>
          </div>
          <div className={styles.progressBarTrack}>
            <div className={styles.progressBarFill} style={{ width: `${progress}%` }} />
          </div>
        </div>
      );
    }

    // Default: uploaded
    return (
      <div className={styles.statusProcessingContainer}>
        <span className={styles.badgeUploaded}>Uploading...</span>
      </div>
    );
  };

  if (isLoading) {
    return <div className={styles.loadingState}>Loading study materials...</div>;
  }

  if (error) {
    return <div className={styles.errorState}>{error}</div>;
  }

  if (materials.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>📂</span>
        <p>No study materials uploaded yet.</p>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      <h3 className={styles.listHeading}>Study Materials</h3>
      <div className={styles.materialsGrid}>
        {materials.map((material) => (
          <div key={material._id} className={styles.materialCard}>
            <div className={styles.materialMainInfo}>
              <div className={styles.materialIcon}>{getFileIcon(material.fileType)}</div>
              <div className={styles.materialDetails}>
                <h4 className={styles.materialTitle} title={material.title}>
                  {material.title}
                </h4>
                <p className={styles.materialMeta}>
                  {new Date(material.createdAt).toLocaleDateString()} •{' '}
                  {(material.fileSize / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
              <div className={styles.materialActions}>
                <a
                  href={material.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.actionBtn}
                  title="View Material"
                >
                  👁️
                </a>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(material._id)}
                  disabled={isDeleting === material._id}
                  title="Delete Material"
                >
                  {isDeleting === material._id ? '⏳' : '🗑️'}
                </button>
              </div>
            </div>

            <div className={styles.statusSection}>{renderStatusBadge(material)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MaterialList;

