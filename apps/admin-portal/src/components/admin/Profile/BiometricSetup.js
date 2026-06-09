import React, { useState } from 'react';
import { startRegistration } from '@simplewebauthn/browser';
import axios from 'axios';

const BiometricSetup = () => {
    const [status, setStatus] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(false);

    const handleSetup = async () => {
        setLoading(true);
        setStatus({ type: 'info', text: 'Initializing biometric scanner...' });

        try {
            // 1. Get registration options from server
            const { data: options } = await axios.get('/api/v1/auth/webauthn/register-options');

            // 2. Start biometric registration (Fingerprint/FaceID)
            const attResp = await startRegistration(options);

            // 3. Verify registration with server
            await axios.post('/api/v1/auth/webauthn/verify-registration', attResp);

            setStatus({ type: 'success', text: 'Biometric Access Enabled! 🛡️' });
        } catch (error) {
            console.error(error);
            setStatus({ 
                type: 'error', 
                text: error.response?.data?.error || error.message || 'Registration failed' 
            });
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
            border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h3 style={{ margin: 0, fontSize: '18px', color: '#fff' }}>Biometric Login (Passkeys)</h3>
                    <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: '#888' }}>
                        Unlock your console using Fingerprint or FaceID for faster, more secure access.
                    </p>
                </div>
                <button 
                    onClick={handleSetup} 
                    disabled={loading}
                    style={{
                        background: '#0070f3',
                        color: '#fff',
                        border: 'none',
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontWeight: '700',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1,
                        transition: 'all 0.2s'
                    }}
                >
                    {loading ? 'Scanning...' : 'Enable Biometrics'}
                </button>
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
