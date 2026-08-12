/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import React from 'react';
import styles from '../settings.module.css';
import { useMutation } from '@tanstack/react-query';
import { useSecureQuery, useSecureQueryClient } from 'secure-query-cache';
import axios from 'axios';

import SettingsGroup from '@/features/settings/SettingsGroup';
import SettingsItem from '@/features/settings/SettingsItem';

export default function SecurityPrivacyPage() {
  const queryClient = useSecureQueryClient();

  const { data: settings = {}, isLoading } = useSecureQuery({
    queryKey: ['globalSettings'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/settings');
      return res.data;
    },
  });

  const toggleSettingMutation = useMutation({
    mutationFn: async ({ key, value }) => {
      const res = await axios.post('/api/admin/settings/update', { key, value });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['globalSettings'] });
      if (typeof window !== 'undefined' && window.__FORCE_RE_HANDSHAKE__) {
        window.__FORCE_RE_HANDSHAKE__();
      }
    },
  });

  const isEncryptionEnabled = settings.is_encryption_enabled === true;
  const isEnhancedAuditEnabled = settings.is_enhanced_audit_enabled === true;

  return (
    <div className={styles.settingsContainer}>
        <SettingsGroup title="Security & Privacy">
          <SettingsItem 
            icon="/admin-images/lock.png"
            title="Hybrid Encryption (RSA-AES)"
            description="Secure all browser-server traffic. Prevents data theft on compromised networks."
            statusText={isEncryptionEnabled ? 'Encrypted' : 'Insecure'}
            statusColor={isEncryptionEnabled ? 'var(--primary)' : '#ef4444'}
            checked={isEncryptionEnabled}
            onChange={() => toggleSettingMutation.mutate({ key: 'is_encryption_enabled', value: !isEncryptionEnabled })}
            disabled={isLoading}
            loading={toggleSettingMutation.isPending}
          />
          <SettingsItem 
            icon="/admin-images/history.png"
            title="Enhanced Audit Logging"
            description="Track every single admin action with detailed metadata and IP tracking."
            statusText={isEnhancedAuditEnabled ? 'Active' : 'Disabled'}
            statusColor={isEnhancedAuditEnabled ? 'var(--primary)' : '#888'}
            checked={isEnhancedAuditEnabled}
            onChange={() => toggleSettingMutation.mutate({ key: 'is_enhanced_audit_enabled', value: !isEnhancedAuditEnabled })}
            disabled={isLoading}
            loading={toggleSettingMutation.isPending}
            beta={true}
          />
        </SettingsGroup>
      </div>
  );
}
