import React, { useState, useEffect } from 'react';
import styles from './MaterialList.module.css';

const MaterialList = ({ subjectId, unitId, topicId }) => {
  const [materials, setMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(null); // Track which material is being deleted

  // Fetch materials whenever the component mounts or dependencies change
  const fetchMaterials = async () => {
    setIsLoading(true);
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

      setMaterials(data.materials);
    } catch (err) {
      setError(err.message || 'Error loading materials');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
    // Expose fetch function globally for sibling components to trigger refresh
    // Not ideal but a simple way to communicate without lifting state or context
    window.addEventListener('materialUploaded', fetchMaterials);
    return () => {
      window.removeEventListener('materialUploaded', fetchMaterials);
    };
  }, [subjectId, unitId, topicId]);

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

  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('docx')) return '📝';
    return '📃'; // text
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
            <div className={styles.materialIcon}>{getFileIcon(material.fileType)}</div>
            <div className={styles.materialDetails}>
              <h4 className={styles.materialTitle} title={material.title}>{material.title}</h4>
              <p className={styles.materialMeta}>
                {new Date(material.createdAt).toLocaleDateString()} • {(material.fileSize / (1024 * 1024)).toFixed(2)} MB
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
        ))}
      </div>
    </div>
  );
};

export default MaterialList;
