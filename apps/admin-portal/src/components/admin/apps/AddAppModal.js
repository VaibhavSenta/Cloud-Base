'use client';

import React, { useState } from 'react';
import NextImage from 'next/image';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import styles from './AddAppModal.module.css';

export default function AddAppModal({ isOpen, onClose }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    name: '',
    userUrl: '',
    icon: 'apps',
    description: '',
    port: '',
    environment: 'production'
  });

  const addAppMutation = useMutation({
    mutationFn: async (newAppData) => {
      const res = await axios.post('/api/admin/managedapps/add', newAppData);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appsList'] });
      onClose();
      setFormData({
        title: '',
        name: '',
        userUrl: '',
        icon: 'apps',
        description: '',
        port: '',
        environment: 'production'
      });
    },
    onError: (err) => {
      alert(err.response?.data?.msg || "Failed to register new app");
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Create a copy and handle empty port properly
    const payload = { 
      ...formData, 
      port: formData.port === '' ? null : parseInt(formData.port) 
    };
    
    addAppMutation.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Register New Ecosystem Member</h2>
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
                placeholder="e.g. Chat Engine" 
                value={formData.title} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Internal Name (Slug)</label>
              <input 
                name="name" 
                placeholder="e.g. chat" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>User-Facing URL</label>
              <input 
                name="userUrl" 
                placeholder="chat.cloudbase.com" 
                value={formData.userUrl} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Icon (Material Name or URL)</label>
              <input 
                name="icon" 
                placeholder="apps, chat, /icons/chat.png" 
                value={formData.icon} 
                onChange={handleInputChange} 
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Infrastructure Port</label>
              <input 
                type="number" 
                name="port" 
                placeholder="3001" 
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
          </div>

          <div className={styles.inputGroup} style={{ marginTop: '16px' }}>
            <label>App Description</label>
            <textarea 
              name="description" 
              placeholder="Describe the purpose of this service..." 
              value={formData.description} 
              onChange={handleInputChange} 
              rows="3"
            />
          </div>

          <div className={styles.formActions}>
            <button type="button" className={styles.cancelBtn} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.confirmBtn} disabled={addAppMutation.isPending}>
              {addAppMutation.isPending ? 'Provisioning...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
