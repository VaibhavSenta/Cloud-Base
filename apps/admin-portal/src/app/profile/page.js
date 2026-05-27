'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/admin/AdminLayout/AdminLayout';
import styles from './profile.module.css';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export default function ProfilePage() {
    const queryClient = useQueryClient();
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        loginid: ''
    });
    const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

    // 1. Fetch Admin Profile
    const { data: admin, isLoading, error } = useQuery({
        queryKey: ['adminProfile'],
        queryFn: async () => {
            const res = await axios.get('/api/admin/profile');
            return res.data.data;
        }
    });

    // 1.1 Fetch Active Sessions
    const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
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
            setStatusMsg({ type: 'success', text: 'Profile updated successfully! ✨' });
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
        <AdminLayout>
            <div className={styles.profileWrapper}>
                {/* SECTION 1: IDENTITY */}
                <div className={styles.sectionBlock}>
                    <div className={styles.sectionHeader}>
                        <h2>Admin Identity</h2>
                        {!isLoading && !error && !isEditing && (
                            <button 
                                className={styles.editToggleBtn}
                                onClick={() => setIsEditing(true)}
                            >
                                <span className="material-symbols-outlined">edit</span>
                                <span>Edit Profile</span>
                            </button>
                        )}
                        {isEditing && (
                            <button 
                                className={styles.cancelBtn}
                                onClick={() => {
                                    setIsEditing(false);
                                    setFormData({
                                        firstname: admin.firstname || '',
                                        lastname: admin.lastname || '',
                                        loginid: admin.loginid || ''
                                    });
                                }}
                            >
                                Cancel
                            </button>
                        )}
                    </div>

                    <div className={styles.profileCard}>
                        <div className={styles.shimmer}></div>
                        
                        {isLoading ? (
                            <div style={{ color: '#bcc9cd', textAlign: 'center', padding: '40px' }}>
                                Loading Profile Data...
                            </div>
                        ) : error ? (
                            <div className={`${styles.message} ${styles.errorMsg}`}>
                                ❌ Error: {error.message}
                            </div>
                        ) : (
                            <>
                                <div className={styles.profileHeader}>
                                    <div className={styles.largeAvatar}>
                                        <img 
                                            alt="Admin Avatar" 
                                            src="https://lh3.googleusercontent.com/d/1ThnxTHqvV7Mrf0RtDrfTyt-0uHXPPujl" 
                                        />
                                    </div>
                                    <div className={styles.profileTitleInfo}>
                                        <h1>{admin.firstname} {admin.lastname}</h1>
                                        <p>System Administrator • Root Access</p>
                                    </div>
                                </div>

                                {statusMsg.text && (
                                    <div className={`${styles.message} ${statusMsg.type === 'success' ? styles.successMsg : styles.errorMsg}`}>
                                        {statusMsg.text}
                                    </div>
                                )}

                                <form className={styles.form} onSubmit={handleSubmit}>
                                    <div className={styles.formGrid}>
                                        <div className={styles.inputGroup}>
                                            <label>First Name</label>
                                            <input 
                                                type="text" 
                                                name="firstname"
                                                className={styles.inputField}
                                                value={formData.firstname}
                                                onChange={handleChange}
                                                required
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className={styles.inputGroup}>
                                            <label>Last Name</label>
                                            <input 
                                                type="text" 
                                                name="lastname"
                                                className={styles.inputField}
                                                value={formData.lastname}
                                                onChange={handleChange}
                                                disabled={!isEditing}
                                            />
                                        </div>
                                        <div className={`${styles.inputGroup} ${styles.fullWidth}`}>
                                            <label>Login ID (Read Only)</label>
                                            <input 
                                                type="text" 
                                                className={styles.inputField}
                                                value={formData.loginid}
                                                disabled
                                            />
                                        </div>
                                    </div>

                                    {isEditing && (
                                        <div className={styles.actionRow}>
                                            <button 
                                                type="submit" 
                                                className={styles.saveBtn}
                                                disabled={updateMutation.isPending}
                                            >
                                                {updateMutation.isPending ? 'Updating...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    )}
                                </form>
                            </>
                        )}
                    </div>
                </div>

                {/* SECTION 2: ACTIVE SESSIONS */}
                <div className={styles.sectionBlock}>
                    <div className={styles.sectionHeader}>
                        <h2>Active Sessions</h2>
                        <span className={styles.sectionSub}>Devices currently logged in</span>
                    </div>
                    
                    <div className={styles.sessionsGrid}>
                        {sessionsLoading ? (
                            <div style={{ color: '#bcc9cd', padding: '20px' }}>Loading sessions...</div>
                        ) : sessions.length === 0 ? (
                            <div style={{ color: '#bcc9cd', padding: '20px' }}>No active sessions found.</div>
                        ) : (
                            sessions.map((session) => (
                                <div key={session._id} className={styles.sessionCard}>
                                    <div className={styles.sessionIcon}>
                                        <span className="material-symbols-outlined">
                                            {session.deviceType === 'Mobile' ? (

                                                <img src="./mobile-icon.png" alt="Mobile" />
                                            ) : (

                                                <img src="./desktop-icon.png" alt="Desktop" />
                                            )}
                                        </span>
                                    </div>
                                    <div className={styles.sessionInfo}>
                                        <div className={styles.sessionMain}>
                                            <h3>{session.deviceType} Session</h3>
                                            <span className={styles.ipBadge}>{session.ipAddress}</span>
                                        </div>
                                        <p className={styles.sessionTime}>Logged in: {formatDate(session.createdAt)}</p>
                                        <p className={styles.sessionTime}>Last active: {formatDate(session.lastActive)}</p>
                                    </div>
                                    <button 
                                        className={styles.terminateBtn}
                                        onClick={() => terminateSessionMutation.mutate(session._id)}
                                        disabled={terminateSessionMutation.isPending}
                                        title="Terminate Session"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* DANGER ZONE: Session Management */}
                {!isLoading && !error && (
                    <div className={styles.sectionBlock}>
                        <div className={styles.sectionHeader}>
                            <h2 style={{ color: '#ff4d4d' }}>Account Security</h2>
                        </div>
                        <div className={`${styles.logoutCard} ${styles.dangerZone}`}>
                            <div className={styles.dangerInfo}>
                                <h3>Logout from Console</h3>
                                <p>Terminate your current session and clear all local security tokens.</p>
                            </div>
                            <button 
                                type="button"
                                className={styles.dangerBtn}
                                onClick={handleLogout}
                            >
                                <span className="material-symbols-outlined">{'>'}</span>
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
