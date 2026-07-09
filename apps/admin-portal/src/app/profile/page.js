'use client';

import React, { useState, useEffect } from 'react';
import styles from './profile.module.css';
import NextImage from 'next/image';
import { useMutation } from '@tanstack/react-query';
import { useSecureQuery, useSecureQueryClient } from 'secure-query-cache';
import axios from 'axios';

import ProfileIdentity from '@/features/profile/ProfileIdentity/Component';
import SessionCard from '@/features/profile/SessionCard';
import dynamic from 'next/dynamic';

const BiometricSetup = dynamic(() => import('@/features/profile/BiometricSetup'), { ssr: false });

export default function ProfilePage() {
    const queryClient = useSecureQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        loginid: ''
    });
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    // 1. Fetch Admin Profile
    const { data: admin, isLoading, error } = useSecureQuery({
        queryKey: ['adminProfile'],
        queryFn: async () => {
            const res = await axios.get('/api/admin/profile');
            return res.data.data;
        }
    });

    // 1.1 Fetch Active Sessions
    const { data: sessions = [], isLoading: sessionsLoading } = useSecureQuery({
        queryKey: ['activeSessions'],
        queryFn: async () => {
            const res = await axios.get('/api/admin/profile/sessions');
            return res.data.data;
        }
    });

    // Sync form data when admin data is loaded
    useEffect(() => {
        if (admin) {
            setFormData({
                firstname: admin.firstname || '',
                lastname: admin.lastname || '',
                loginid: admin.loginid || ''
            });
        }
    }, [admin]);

    // 2. Update Profile Mutation
    const updateMutation = useMutation({
        mutationFn: async (updatedData) => {
            const res = await axios.put('/api/admin/profile/update', updatedData);
            return res.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['adminProfile'] });
            setStatusMsg({ type: 'success', text: 'Profile updated successfully!' });
            setIsEditing(false); // Switch back to view mode
            setTimeout(() => setStatusMsg({ type: '', text: '' }), 3000);
        },
        onError: (err) => {
            setStatusMsg({ type: 'error', text: err.response?.data?.msg || 'Failed to update profile' });
        }
    });

    // 2.1 Terminate Session Mutation
    const terminateSessionMutation = useMutation({
        mutationFn: async (sessionId) => {
            const res = await axios.delete(`/api/admin/profile/sessions/${sessionId}`);
            return res.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['activeSessions'] });
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate({
            firstname: formData.firstname,
            lastname: formData.lastname
        });
    };

    const handleLogout = async () => {
        try {
            await axios.post('/api/admin/auth/logout');
            window.location.href = '/'; 
        } catch (err) {
            console.error('Logout failed:', err);
        }
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
            <div className={styles.profileWrapper}>
                <header className={styles.pageHeader}>
                   <h1>Admin Control Profile</h1>
                   <p>Manage your administrative identity and active console sessions.</p>
                </header>

                {/* SECTION 1: IDENTITY */}
                <div className={styles.sectionBlock}>
                    {isLoading ? (
                        <div className={styles.loader}>Syncing Profile Node...</div>
                    ) : error ? (
                        <div className={styles.errorBanner}>❌ Access Denied: {error.message}</div>
                    ) : (
                        <>
                            <ProfileIdentity 
                                admin={admin}
                                formData={formData}
                                handleChange={handleChange}
                                handleSubmit={handleSubmit}
                                isEditing={isEditing}
                                setIsEditing={setIsEditing}
                                updateMutation={updateMutation}
                                statusMsg={statusMsg}
                            />
                            
                            {/* MOBILE QUICK LINKS */}
                            <div className={styles.mobileQuickLinks}>
                                <div className={styles.quickLinkCard} onClick={() => window.location.href = '/dashboard/settings'}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div className={styles.quickLinkIcon}>⚙️</div>
                                        <div>
                                            <h4>Global Settings</h4>
                                            <p>Manage system protocols and preferences.</p>
                                        </div>
                                    </div>
                                    <span className={styles.arrow}>→</span>
                                </div>
                            </div>

                            <BiometricSetup />
                        </>
                    )}
                </div>

                {/* SECTION 2: ACTIVE SESSIONS */}
                <div className={styles.sectionBlock}>
                    <div className={styles.sectionHeader}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                           <h2>Authorized Sessions</h2>
                           <span className={styles.badge}>{sessions.length} Active</span>
                        </div>
                    </div>
                    
                    <div className={styles.sessionsGrid}>
                        {sessionsLoading ? (
                             <div className={styles.loader}>Tracking active links...</div>
                        ) : sessions.length === 0 ? (
                            <div className={styles.emptySessions}>No active sessions found in this perimeter.</div>
                        ) : (
                            sessions.map((session) => (
                                <SessionCard 
                                    key={session._id}
                                    session={session}
                                    formatDate={formatDate}
                                    onTerminate={(id) => terminateSessionMutation.mutate(id)}
                                    isToggling={terminateSessionMutation.isPending}
                                />
                            ))
                        )}
                    </div>
                </div>

                {/* ACCOUNT SECURITY */}
                <div className={styles.sectionBlock}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.dangerTitle}>System Access Security</h2>
                    </div>
                    <div className={styles.logoutCard}>
                        <div className={styles.logoutInfo}>
                            <h3>Immediate Logout</h3>
                            <p>Forcibly close your current session and purge local authorization tokens from this browser.</p>
                        </div>
                        <button className={styles.logoutBtn} onClick={handleLogout}>
                            <NextImage src="/admin-images/logout.png" width={20} height={20} alt="" style={{ filter: 'brightness(0) invert(1)' }} />
                            <span>Sign Out of Console</span>
                        </button>
            </div>
            </div>
            </div>
    );
}
