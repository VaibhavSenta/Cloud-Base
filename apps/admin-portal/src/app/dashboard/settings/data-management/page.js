'use client';

import React from 'react';
import styles from '../settings.module.css';
import { useMutation } from '@tanstack/react-query';
import { useSecureQuery, useSecureQueryClient } from 'secure-query-cache';
import axios from 'axios';

import SettingsGroup from '@/features/settings/SettingsGroup';
import SettingsItem from '@/features/settings/SettingsItem';

export default function DataManagementPage() {
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
    },
  });

  const isAutoPurgeEnabled = settings.is_auto_purge_enabled !== false;

  return (
    <div className={styles.settingsContainer}>
        <SettingsGroup title="Data Management">
          <SettingsItem 
            icon="/admin-images/auto-delete.png"
            title="Auto-Purge Expired Sessions"
            description="Automatically remove session data from database after 30 days of inactivity."
            statusText={isAutoPurgeEnabled ? "Active" : "Disabled"}
            statusColor={isAutoPurgeEnabled ? "var(--primary)" : "#ef4444"}
            checked={isAutoPurgeEnabled}
            onChange={() => toggleSettingMutation.mutate({ key: 'is_auto_purge_enabled', value: !isAutoPurgeEnabled })}
            disabled={isLoading}
            loading={toggleSettingMutation.isPending}
          />
        </SettingsGroup>
      </div>
  );
}
