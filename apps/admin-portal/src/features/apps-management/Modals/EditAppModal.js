'use client';

import React, { useState, useEffect } from 'react';
import NextImage from 'next/image';
import { useMutation } from '@tanstack/react-query';
import { useSecureQueryClient } from 'secure-query-cache';
import axios from 'axios';
import styles from './EditAppModal.module.css';

export default function EditAppModal({ isOpen, onClose, appData }) {
  const queryClient = useSecureQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    userUrl: '',
    icon: 'apps',
    description: '',
    port: '',
    environment: 'production',
    status: 'optimal'
  });

  // Sync state with appData when it changes
  useEffect(() => {
    if (appData) {
      setFormData({
        title: appData.title || '',
        name: appData.name || '',
        userUrl: appData.userUrl || '',
        icon: appData.icon || 'apps',
        description: appData.description || '',
        port: appData.port || '',
        environment: appData.environment || 'production',
        status: appData.status || 'optimal'
      });
    }
  }, [appData]);

  const updateAppMutation = useMutation({
    mutationFn: async (updatedData) => {
      const res = await axios.put(`/api/admin/managedapps/update/${appData._id}`, updatedData);
      return res.data;
    },
    onSuccess: () => {
      // Refresh both lists and single app details
      queryClient.invalidateQueries({ queryKey: ['appsList'] });
      queryClient.invalidateQueries({ queryKey: ['appDetails', appData.name] });
      onClose();
    },
    onError: (err) => {
      alert(err.response?.data?.msg || "Failed to update app configuration");
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = { 
      ...formData, 
      port: formData.port === '' ? null : parseInt(formData.port) 
    };
    updateAppMutation.mutate(payload);
  };

  if (!isOpen || !appData) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Update Service Metadata</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <NextImage src="/admin-images/close.png" width={18} height={18} alt="Close" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.modalForm}>
          <div className={styles.formGrid}>
            <div className={styles.inputGroup}>
              <label>App Title</label>
              <input 
                name="title" 
                value={formData.title} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Internal Name (Slug)</label>
              <input 
                name="name" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>User-Facing URL</label>
              <input 
                name="userUrl" 
                value={formData.userUrl} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Icon (Material Name or URL)</label>
              <input 
                name="icon" 
                value={formData.icon} 
                onChange={handleInputChange} 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Infrastructure Port</label>
              <input 
                type="number" 
                name="port" 
                value={formData.port} 
                onChange={handleInputChange} 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Environment</label>
              <select name="environment" value={formData.environment} onChange={handleInputChange}>
                <option value="production">Production</option>
                <option value="staging">Staging</option>
                <option value="development">Development</option>
              </select>
            </div>
            <div className={styles.inputGroup}>
              <label>System Status</label>
              <select name="status" value={formData.status} onChange={handleInputChange}>
                <option value="optimal">Optimal (Stable)</option>
                <option value="degraded">Degraded (Warning)</option>
                <option value="down">Down (Critical)</option>
              </select>
            </div>
          </div>

          <div className={styles.inputGroup} style={{ marginTop: '16px' }}>
            <label>App Description</label>
            <textarea 
              name="description" 
              value={formData.description} 
              onChange={handleInputChange} 
              rows="3"
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.confirmBtn} disabled={updateAppMutation.isPending}>
              {updateAppMutation.isPending ? 'Updating...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
