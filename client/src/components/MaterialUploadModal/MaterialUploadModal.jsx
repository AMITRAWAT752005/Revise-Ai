import React, { useState, useRef, useEffect } from 'react';
import styles from './MaterialUploadModal.module.css';

const MaterialUploadModal = ({ isOpen, onClose, onUploadSuccess, subjectId, unitId, topicId }) => {
  const fileInputRef = useRef(null);
  
  // States: 'select' | 'uploading'
  const [modalState, setModalState] = useState('select');
  const [selectedFile, setSelectedFile] = useState(null);
  const [title, setTitle] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setModalState('select');
      setSelectedFile(null);
      setTitle('');
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
    setErrorMessage('');
    const validExtensions = ['.pdf', '.docx', '.txt'];
    const fileName = file.name.toLowerCase();
    const isValidExt = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidExt) {
      setErrorMessage('Please upload a supported format: PDF, DOCX, or TXT.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('Maximum file size is 10MB.');
      return;
    }

    setSelectedFile(file);
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
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

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file to upload.');
      return;
    }
    if (!title.trim()) {
      setErrorMessage('Please provide a title.');
      return;
    }

    setModalState('uploading');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('title', title);
    if (subjectId) formData.append('subjectId', subjectId);
    if (unitId) formData.append('unitId', unitId);
    if (topicId) formData.append('topicId', topicId);

    try {
      const response = await fetch('/api/materials/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to upload material');
      }

      if (onUploadSuccess) onUploadSuccess(data.material);
      onClose(); // close modal on success
    } catch (err) {
      setErrorMessage(err.message || 'An error occurred during upload.');
      setModalState('select'); // revert back to select so they can try again
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        {/* Top AI Glow Border */}
        <div className={styles.glowTopBorder}></div>

        {/* Modal Header */}
        <div className={styles.modalHeader}>
          <div className={styles.headerLeft}>
            <div className={styles.headerIcon}>
              <span className="material-symbols-outlined">upload_file</span>
            </div>
            <h2 className={styles.modalTitle}>Upload Study Material</h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal" disabled={modalState === 'uploading'}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className={styles.modalBody}>
          {errorMessage && (
            <div className={styles.errorBanner}>
              <span className="material-symbols-outlined">error</span>
              <p>{errorMessage}</p>
            </div>
          )}

          {modalState === 'select' && (
            <>
              {/* Title Input */}
              <div className={styles.inputGroup}>
                <label htmlFor="materialTitle">Title</label>
                <input
                  type="text"
                  id="materialTitle"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Chapter 1 Notes"
                />
              </div>

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
                  <div className={styles.dropIconBox}>
                    <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>
                      cloud_upload
                    </span>
                  </div>
                  <h3 className={styles.dropTitle}>Drag & drop file here</h3>
                  <p className={styles.dropSubtitle}>
                    Upload your lectures, notes, or practice documents.
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
              <div className={styles.maxSizeNote}>Maximum file size: 10MB</div>
            </>
          )}

          {modalState === 'uploading' && (
            <div className={styles.uploadingContainer}>
              <div className={styles.pulseWrapper}>
                <div className={styles.pulseRing}></div>
                <div className={styles.iconCore}>
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>
                    cloud_upload
                  </span>
                </div>
              </div>
              <h3 className={styles.uploadingTitle}>Uploading Material...</h3>
              <p className={styles.uploadingSubtitle}>Please wait while we securely store your document.</p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        {modalState === 'select' && (
          <div className={styles.modalFooter}>
            <button className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button
              className={styles.primaryActionBtn}
              onClick={handleUpload}
              disabled={!selectedFile || !title.trim()}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                upload
              </span>
              <span>Upload Document</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialUploadModal;
