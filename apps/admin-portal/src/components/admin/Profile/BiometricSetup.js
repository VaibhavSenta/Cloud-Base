import React, { useState, useEffect } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import axios from 'axios';

const BiometricSetup = () => {
    const [status, setStatus] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);
    const [isLocalDeviceRegistered, setIsLocalDeviceRegistered] = useState(false);

    useEffect(() => {
        // Check if this specific browser/device has a passkey registered
        const registered = localStorage.getItem('passkey_registered');
        if (registered === 'true') {
            setIsLocalDeviceRegistered(true);
        }
    }, []);

    const handleSetup = async () => {
        setLoading(true);
        setStatus({ type: 'info', text: 'Initializing biometric scanner...' });

        try {
            // 1. Get registration options from server
            const { data: options } = await axios.get('/api/admin/auth/webauthn/register-options');

            // 2. Start biometric registration (Fingerprint/FaceID)
            const attResp = await startRegistration({ optionsJSON: options });

            // 3. Verify registration with server
            await axios.post('/api/admin/auth/webauthn/verify-registration', attResp);

            setStatus({ type: 'success', text: 'Biometric Access Enabled! 🛡️' });
            
            // Mark this device as registered in local storage
            localStorage.setItem('passkey_registered', 'true');
            setIsLocalDeviceRegistered(true);

        } catch (error) {
            console.error(error);
            let errorText = error.response?.data?.error || error.message || 'Registration failed';
            
            // Handle specific browser error when trying to register an already registered device
            if (error.name === 'InvalidStateError') {
                errorText = 'This device is already registered.';
            }

            setStatus({ 
                type: 'error', 
                text: errorText 
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDisable = async () => {
        if (!confirm('Are you sure you want to revoke biometric access for all devices?')) return;
        
        setLoading(true);
        setStatus({ type: 'info', text: 'Revoking access...' });

        try {
            await axios.delete('/api/admin/auth/webauthn/credentials');
            localStorage.removeItem('passkey_registered');
            setIsLocalDeviceRegistered(false);
            setStatus({ 
                type: 'error', 
                text: 'Access revoked! Note: You may still need to manually delete the passkey from your device\'s password manager.' 
            });
        } catch (error) {
            console.error(error);
            setStatus({ type: 'error', text: 'Failed to revoke access' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ 
            marginTop: '20px', 
            padding: '24px', 
            background: 'rgba(255, 255, 255, 0.03)', 
            borderRadius: '16px',
            border: isLocalDeviceRegistered ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255, 255, 255, 0.05)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        Biometric Login (Passkeys)
                        {isLocalDeviceRegistered && <span style={{ fontSize: '12px', background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', padding: '2px 8px', borderRadius: '100px' }}>Active Here</span>}
                    </h3>
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#888' }}>
                        {isLocalDeviceRegistered 
                            ? 'You can already use Fingerprint/FaceID to login from this device.'
                            : 'Unlock your console using Fingerprint or FaceID for faster, more secure access.'}
                    </p>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                    {isLocalDeviceRegistered && (
                        <button 
                            onClick={handleDisable} 
                            disabled={loading}
                            style={{
                                background: 'transparent',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.3)',
                                padding: '8px 16px',
                                borderRadius: '8px',
                                fontWeight: '600',
                                fontSize: '13px',
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            Disable All
                        </button>
                    )}
                    
                    <button 
                        onClick={handleSetup} 
                        disabled={loading}
                        style={{
                            background: isLocalDeviceRegistered ? 'transparent' : '#0070f3',
                            color: isLocalDeviceRegistered ? '#888' : '#fff',
                            border: isLocalDeviceRegistered ? '1px solid rgba(255,255,255,0.1)' : 'none',
                            padding: isLocalDeviceRegistered ? '8px 16px' : '10px 20px',
                            borderRadius: isLocalDeviceRegistered ? '8px' : '10px',
                            fontWeight: isLocalDeviceRegistered ? '600' : '700',
                            fontSize: isLocalDeviceRegistered ? '13px' : '14px',
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.7 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        {loading ? 'Scanning...' : (isLocalDeviceRegistered ? 'Register Another Device' : 'Enable Biometrics')}
                    </button>
                </div>
            </div>

            {status.text && (
                <div style={{ 
                    marginTop: '16px', 
                    padding: '12px', 
                    borderRadius: '8px', 
                    fontSize: '13px',
                    textAlign: 'center',
                    background: status.type === 'error' ? 'rgba(255, 77, 77, 0.1)' : 
                               status.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(0, 112, 243, 0.1)',
                    color: status.type === 'error' ? '#ff4d4d' : 
                           status.type === 'success' ? '#10b981' : '#0070f3',
                    border: `1px solid ${
                        status.type === 'error' ? 'rgba(255, 77, 77, 0.2)' : 
                        status.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(0, 112, 243, 0.2)'
                    }`
                }}>
                    {status.text}
                </div>
            )}
        </div>
    );
};

export default BiometricSetup;
