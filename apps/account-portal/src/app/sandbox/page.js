'use client';
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { localEncrypt } from '@/utils/security/localCrypto';

// UI Components
import Button from '@/components/UI/Button/Button';
import Input from '@/components/UI/Input/Input';
import CloudSpinner from '@/components/UI/CloudSpinner/CloudSpinner';
import SuccessOverlay from '@/components/UI/SuccessOverlay/SuccessOverlay';
import InfoModal from '@/components/UI/InfoModal/InfoModal';
import BottomSheet from '@/components/UI/BottomSheet/BottomSheet';

// Feature Components
import LoginBox from '@/features/auth/LoginBox/LoginBox';
import PersonalInfo from '@/features/personal-info/PersonalInfo';
import TwoFactorSettings from '@/features/two-factor-settings/TwoFactorSettings';

// Layout & Global Components
import Header from '@/components/Header/Header';
import Sidebar from '@/components/Sidebar/Sidebar';
import LoadingScreen from '@/components/UI/LoadingScreen/LoadingScreen';
import Logo from '@/components/Logo/Logo';

import styles from './Sandbox.module.css';

export default function SandboxPage() {
  const queryClient = useQueryClient();
  const [activeComponent, setActiveComponent] = useState('Buttons'); // Tab selector
  const [frameSize, setFrameSize] = useState('desktop'); // 'mobile' | 'tablet' | 'desktop'
  
  // Custom mock control states
  const [btnLoading, setBtnLoading] = useState(false);
  const [btnDisabled, setBtnDisabled] = useState(false);
  
  const [inputVal, setInputVal] = useState('');
  const [inputError, setInputError] = useState('');
  
  const [successActive, setSuccessActive] = useState(false);
  const [successText, setSuccessText] = useState('Changes Saved');
  
  const [infoOpen, setInfoOpen] = useState(false);
  const [infoTitle, setInfoTitle] = useState('Developer Update');
  const [infoMessage, setInfoMessage] = useState('This is a custom alert dialog configured from the Sandbox control panel.');
  
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetTitle, setSheetTitle] = useState('Quick Actions');
  const [sheetSubtitle, setSheetSubtitle] = useState('Test sheet content behaves cleanly across all layouts.');

  // Pre-populate query client cache with mock user profile details
  useEffect(() => {
    const mockUser = {
      userName: 'VaibhavS',
      email: 'vaibhavsenta999@gmail.com',
      firstName: 'Vaibhav',
      lastName: 'Senta',
      dob: '1998-05-15T00:00:00.000Z',
      gender: 'Male',
      phonenumber: '+919999999999',
      recoveryEmail: 'recovery@example.com',
      profilePic: '/icons/person.svg',
      twoFactorEnabled: true,
      twoFactorPrimary: 'email',
      twoFactorMethods: {
        email: true,
        authenticator: false
      },
      sessions: [
        { sessionId: '1', deviceName: 'iPhone 15 Pro', deviceType: 'Mobile', browser: 'Safari', ipAddress: '172.20.10.2', isCurrent: true, lastActive: new Date() },
        { sessionId: '2', deviceName: 'MacBook Pro 16"', deviceType: 'Desktop', browser: 'Chrome', ipAddress: '192.168.1.15', isCurrent: false, lastActive: new Date(Date.now() - 3600000) }
      ]
    };
    queryClient.setQueryData(['user'], localEncrypt(mockUser));
  }, [queryClient]);

  const componentsList = [
    { name: 'Buttons', category: 'UI Core' },
    { name: 'Inputs', category: 'UI Core' },
    { name: 'Logo', category: 'UI Core' },
    { name: 'CloudSpinner', category: 'UI Core' },
    { name: 'Modals & Sheets', category: 'Overlays' },
    { name: 'Header', category: 'Layout' },
    { name: 'Sidebar', category: 'Layout' },
    { name: 'LoadingScreen', category: 'Layout' },
    { name: 'LoginBox', category: 'Features' },
    { name: 'PersonalInfo', category: 'Features' },
    { name: 'TwoFactorSettings', category: 'Features' }
  ];

  const triggerSuccessHUD = () => {
    setSuccessActive(true);
    setTimeout(() => {
      setSuccessActive(false);
    }, 2000);
  };

  const getMockWidth = () => {
    if (frameSize === 'mobile') return 390;
    if (frameSize === 'tablet') return 768;
    return 1200; // Desktop
  };

  const renderCenteringWrapper = (children) => (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100%', width: '100%', padding: '2rem' }}>
      {children}
    </div>
  );

  const renderComponent = () => {
    switch (activeComponent) {
      case 'Buttons':
        return renderCenteringWrapper(
          <div className={styles.demoBlock}>
            <h3>Button Component States</h3>
            <div className={styles.flexGroup}>
              <div>
                <span className={styles.label}>Primary Variant</span>
                <Button isLoading={btnLoading} disabled={btnDisabled}>Primary Button</Button>
              </div>
              <div>
                <span className={styles.label}>Secondary Variant</span>
                <Button variant="secondary" isLoading={btnLoading} disabled={btnDisabled}>Secondary Button</Button>
              </div>
              <div>
                <span className={styles.label}>Danger Variant</span>
                <Button variant="danger" isLoading={btnLoading} disabled={btnDisabled}>Danger Button</Button>
              </div>
            </div>
          </div>
        );
      case 'Inputs':
        return renderCenteringWrapper(
          <div className={styles.demoBlock}>
            <h3>Input Component States</h3>
            <div className={styles.flexColumn}>
              <Input 
                label="Standard Label" 
                placeholder="Enter some text..." 
                value={inputVal} 
                onChange={(e) => setInputVal(e.target.value)} 
                error={inputError}
              />
              <Input 
                label="Secure Password Input" 
                type="password"
                placeholder="••••••••" 
              />
            </div>
          </div>
        );
      case 'CloudSpinner':
        return renderCenteringWrapper(
          <div className={styles.demoBlock} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <h3>Cloud Outline Tracer Loader</h3>
            <CloudSpinner size={96} />
            <span style={{ fontSize: '0.8rem', color: '#888' }}>SVG dasharray hardware accelerated tracer loop</span>
          </div>
        );
      case 'Modals & Sheets':
        return renderCenteringWrapper(
          <div className={styles.demoBlock}>
            <h3>Overlay Controls</h3>
            <div className={styles.flexGroup}>
              <Button onClick={triggerSuccessHUD}>Trigger Success HUD</Button>
              <Button onClick={() => setInfoOpen(true)} variant="secondary">Open Info Modal</Button>
              <Button onClick={() => setSheetOpen(true)} variant="secondary">Open Bottom Sheet</Button>
            </div>
          </div>
        );
      case 'Logo':
        return renderCenteringWrapper(
          <div className={styles.demoBlock} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', alignItems: 'center', width: '100%' }}>
            <h3>Brand Logo Variations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
              <div>
                <span className={styles.label}>Default Responsive Logo</span>
                <div style={{ height: '48px', display: 'flex', alignItems: 'center' }}><Logo /></div>
              </div>
              <div>
                <span className={styles.label}>Icon Only Logo (Monochrome theme)</span>
                <div style={{ height: '48px', display: 'flex', alignItems: 'center' }}><Logo forceVersion="icon" theme="monochrome" /></div>
              </div>
              <div>
                <span className={styles.label}>Full Brand Text Logo (Monochrome theme)</span>
                <div style={{ height: '48px', display: 'flex', alignItems: 'center' }}><Logo forceVersion="full" theme="monochrome" /></div>
              </div>
            </div>
          </div>
        );
      case 'Header':
        return (
          <div style={{ width: '100%', padding: '1rem' }}>
            <Header forceWidth={getMockWidth()} />
          </div>
        );
      case 'Sidebar':
        return (
          <div style={{ height: '100%', minHeight: '500px', width: '100%', display: 'flex', overflow: 'hidden' }}>
            <Sidebar forceWidth={getMockWidth()} isOpen={true} />
            <div style={{ flex: 1, padding: '2rem', color: '#888888' }}>Dashboard Content Area</div>
          </div>
        );
      case 'LoadingScreen':
        return <LoadingScreen fullScreen={false} />;
      case 'LoginBox':
        return renderCenteringWrapper(
          <div className={styles.loginFrameWrapper}>
            <LoginBox 
              onAuthSuccess={(user) => alert(`Mock Success! Logged in as: ${user.username}`)} 
              forceWidth={getMockWidth()} 
            />
          </div>
        );
      case 'PersonalInfo':
        return <PersonalInfo forceWidth={getMockWidth()} />;
      case 'TwoFactorSettings':
        return <TwoFactorSettings forceWidth={getMockWidth()} />;
      default:
        return null;
    }
  };

  return (
    <div className={styles.sandboxContainer}>
      
      {/* 🚀 Playground Top Bar */}
      <header className={styles.topBar}>
        <div className={styles.leftInfo}>
          <Link href="/dashboard" className={styles.backBtn}>‹ Dashboard</Link>
          <span className={styles.divider}>|</span>
          <h1 className={styles.title}>Component Sandbox 🛠️</h1>
        </div>
        
        {/* Frame Size Selector (Ruler) */}
        <div className={styles.ruler}>
          <button 
            className={`${styles.rulerBtn} ${frameSize === 'mobile' ? styles.active : ''}`}
            onClick={() => setFrameSize('mobile')}
          >
            📱 Mobile (390px)
          </button>
          <button 
            className={`${styles.rulerBtn} ${frameSize === 'tablet' ? styles.active : ''}`}
            onClick={() => setFrameSize('tablet')}
          >
            📟 Tablet (768px)
          </button>
          <button 
            className={`${styles.rulerBtn} ${frameSize === 'desktop' ? styles.active : ''}`}
            onClick={() => setFrameSize('desktop')}
          >
            🖥️ Desktop (100%)
          </button>
        </div>
      </header>

      {/* 📥 Layout Workspace */}
      <div className={styles.workspace}>
        
        {/* Left Sidebar Menu */}
        <aside className={styles.sidebar}>
          <span className={styles.groupHeader}>Select Component</span>
          <div className={styles.menuList}>
            {componentsList.map((comp) => (
              <button
                key={comp.name}
                className={`${styles.menuItem} ${activeComponent === comp.name ? styles.activeItem : ''}`}
                onClick={() => setActiveComponent(comp.name)}
              >
                <span>{comp.name}</span>
                <span className={styles.categoryBadge}>{comp.category}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Center Frame Viewer */}
        <main className={styles.viewerArea}>
          <div className={`${styles.frameBorder} ${styles[frameSize]}`}>
            <div className={styles.frameHeader}>
              <span className={styles.frameTitle}>Isolated Preview Frame ({frameSize})</span>
              <span className={styles.frameDots}>● ● ●</span>
            </div>
            <div className={styles.frameBody}>
              {renderComponent()}
            </div>
          </div>
        </main>

        {/* Right Props Controls Panel */}
        <aside className={styles.controlsPanel}>
          <span className={styles.groupHeader}>Properties & Mock Controls</span>
          
          <div className={styles.controlsContent}>
            {activeComponent === 'Buttons' && (
              <div className={styles.controlGroup}>
                <label className={styles.checkLabel}>
                  <input type="checkbox" checked={btnLoading} onChange={(e) => setBtnLoading(e.target.checked)} />
                  isLoading State
                </label>
                <label className={styles.checkLabel}>
                  <input type="checkbox" checked={btnDisabled} onChange={(e) => setBtnDisabled(e.target.checked)} />
                  isDisabled State
                </label>
              </div>
            )}

            {activeComponent === 'Inputs' && (
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>Error Message</label>
                <input 
                  type="text" 
                  value={inputError} 
                  onChange={(e) => setInputError(e.target.value)} 
                  className={styles.textInput}
                  placeholder="Set error string..."
                />
                <Button onClick={() => setInputError('Invalid input credentials')} variant="danger" fullWidth>
                  Simulate Error
                </Button>
                <Button onClick={() => setInputError('')} variant="secondary" fullWidth style={{ marginTop: '8px' }}>
                  Clear Error
                </Button>
              </div>
            )}

            {activeComponent === 'Modals & Sheets' && (
              <div className={styles.controlGroup}>
                <label className={styles.controlLabel}>Success Message</label>
                <input 
                  type="text" 
                  value={successText} 
                  onChange={(e) => setSuccessText(e.target.value)} 
                  className={styles.textInput}
                />
                
                <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '1.25rem 0' }} />

                <label className={styles.controlLabel}>Modal Title</label>
                <input 
                  type="text" 
                  value={infoTitle} 
                  onChange={(e) => setInfoTitle(e.target.value)} 
                  className={styles.textInput}
                />

                <label className={styles.controlLabel}>Modal Message</label>
                <textarea 
                  value={infoMessage} 
                  onChange={(e) => setInfoMessage(e.target.value)} 
                  className={styles.textareaInput}
                  rows={3}
                />
              </div>
            )}

            <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
              <p style={{ fontSize: '0.75rem', color: '#666', lineHeight: '1.4' }}>
                Note: Mock User cache is pre-populated inside sandbox setup state to avoid backend connectivity errors.
              </p>
            </div>
          </div>
        </aside>

      </div>

      {/* 🪄 Overlays Rendering */}
      <SuccessOverlay show={successActive} text={successText} />
      
      <InfoModal 
        isOpen={infoOpen} 
        title={infoTitle} 
        message={infoMessage} 
        onClose={() => setInfoOpen(false)} 
      />

      <BottomSheet
        isOpen={sheetOpen}
        title={sheetTitle}
        subtitle={sheetSubtitle}
        onClose={() => setSheetOpen(false)}
        onSubmit={(e) => { e.preventDefault(); setSheetOpen(false); alert('Sheet Action Submitting!'); }}
      >
        <div style={{ padding: '0 0.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Input label="Sheet Form Input" placeholder="Type inside sheet form..." />
          <Button type="submit" fullWidth>Submit Sheet Form</Button>
        </div>
      </BottomSheet>

    </div>
  );
}
