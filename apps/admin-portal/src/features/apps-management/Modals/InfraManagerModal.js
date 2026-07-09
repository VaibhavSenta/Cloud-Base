'use client';

import React, { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { useMutation } from '@tanstack/react-query';
import { useSecureQueryClient } from 'secure-query-cache';
import axios from 'axios';
import styles from './InfraManagerModal.module.css';

export default function InfraManagerModal({ isOpen, onClose, appData }) {
  const queryClient = useSecureQueryClient();
  
  const [dependencies, setDependencies] = useState([]);
  const [quickLinks, setQuickLinks] = useState([]);

  useEffect(() => {
    if (appData) {
      setDependencies(appData.dependencies || []);
      setQuickLinks(appData.quickLinks || []);
    }
  }, [appData, isOpen]);

  const updateMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await axios.put(`/api/admin/managedapps/update/${appData._id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appDetails', appData.name] });
      onClose();
    },
    onError: (err) => {
      alert(err.response?.data?.msg || "Failed to update infrastructure");
    }
  });

  // --- Dependency Handlers ---
  const addDependency = () => {
    setDependencies([...dependencies, { name: '', type: '', status: 'optimal' }]);
  };

  const removeDependency = (index) => {
    setDependencies(dependencies.filter((_, i) => i !== index));
  };

  const updateDependency = (index, field, value) => {
    const updated = [...dependencies];
    updated[index][field] = value;
    setDependencies(updated);
  };

  // --- Link Handlers ---
  const addLink = () => {
    setQuickLinks([...quickLinks, { label: '', url: '', icon: 'link' }]);
  };

  const removeLink = (index) => {
    setQuickLinks(quickLinks.filter((_, i) => i !== index));
  };

  const updateLink = (index, field, value) => {
    const updated = [...quickLinks];
    updated[index][field] = value;
    setQuickLinks(updated);
  };

  const handleSave = () => {
    updateMutation.mutate({ dependencies, quickLinks });
  };

  if (!isOpen || !appData) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Cluster Node Architecture</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <NextImage src="/admin-images/close.png" width={18} height={18} alt="Close" />
          </button>
        </div>

        <div className={styles.modalBody}>
          {/* Section 1: Service Connectors */}
          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h3>Service Connectors</h3>
              <button className={styles.addBtn} onClick={addDependency}>
                <span className="material-symbols-outlined">add</span> Add
              </button>
            </div>
            <div className={styles.itemList}>
              {dependencies.map((dep, idx) => (
                <div key={idx} className={styles.rowItem}>
                  <input 
                    placeholder="Name (e.g. MongoDB)" 
                    value={dep.name} 
                    onChange={(e) => updateDependency(idx, 'name', e.target.value)}
                  />
                  <input 
                    placeholder="Type (e.g. Database)" 
                    value={dep.type} 
                    onChange={(e) => updateDependency(idx, 'type', e.target.value)}
                  />
                  <select 
                    value={dep.status} 
                    onChange={(e) => updateDependency(idx, 'status', e.target.value)}
                  >
                    <option value="optimal">Optimal</option>
                    <option value="degraded">Degraded</option>
                    <option value="down">Down</option>
                  </select>
                  <button className={styles.removeBtn} onClick={() => removeDependency(idx)}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
              {dependencies.length === 0 && <p className={styles.empty}>No connectors registered.</p>}
            </div>
          </section>

          {/* Section 2: Ecosystem Links */}
          <section className={styles.formSection}>
            <div className={styles.sectionHeader}>
              <h3>Ecosystem Links</h3>
              <button className={styles.addBtn} onClick={addLink}>
                <span className="material-symbols-outlined">add</span> Add
              </button>
            </div>
            <div className={styles.itemList}>
              {quickLinks.map((link, idx) => (
                <div key={idx} className={styles.rowItem}>
                  <input 
                    placeholder="Label (e.g. GitHub)" 
                    value={link.label} 
                    onChange={(e) => updateLink(idx, 'label', e.target.value)}
                  />
                  <input 
                    placeholder="URL" 
                    value={link.url} 
                    onChange={(e) => updateLink(idx, 'url', e.target.value)}
                  />
                  <input 
                    placeholder="Icon (Material)" 
                    value={link.icon} 
                    onChange={(e) => updateLink(idx, 'icon', e.target.value)}
                    className={styles.smallInput}
                  />
                  <button className={styles.removeBtn} onClick={() => removeLink(idx)}>
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
              {quickLinks.length === 0 && <p className={styles.empty}>No links added.</p>}
            </div>
          </section>
        </div>

        <div className={styles.formActions}>
          <button className={styles.cancelBtn} onClick={onClose}>Cancel</button>
          <button className={styles.saveBtn} onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? 'Syncing...' : 'Save Infrastructure'}
          </button>
        </div>
      </div>
    </div>
  );
}
