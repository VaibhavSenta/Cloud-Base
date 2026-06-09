'use client';

import React from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import styles from '../settings.module.css';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

import SettingsGroup from '@/components/admin/Settings/SettingsGroup';
import SettingsItem from '@/components/admin/Settings/SettingsItem';

export default function DataManagementPage() {
  const queryClient = useQueryClient();

  const { data: settings = {}, isLoading } = useQuery({
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
    <AdminLayout>
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
    </AdminLayout>
  );
}
