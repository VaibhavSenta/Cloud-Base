'use client';
import { useEffect, useState } from 'react';
import Logo from '@/components/Logo/Logo';
import styles from './page.module.css';

const offlineMessages = [
  "Your connection went offline faster than your last relationship. Fix your Wi-Fi.",
  "Offline. Great. Now go find a hobby. And no, staring at this black screen doesn't count.",
  "Connection lost. Honestly, your internet provider is as useless as my developer's sleeping schedule.",
  "You are offline. Go talk to your family. I heard they are actually nice people.",
  "No internet. Have you tried turning your router off, on, and then throwing it out of the window?",
  "Offline. Don't panic. Take a deep breath. Now go scream at your service provider.",
  "Congratulations! You have successfully disconnected from the matrix. Go deal with the real world (spoiler: it has bugs too).",
  "Offline. At least I am not lagging. You are. Go pay your internet bill.",
  "No internet. I could show you a Dino game, but let's be honest, you'd fail at that too. Fix your cables.",
  "No internet. Don't worry, the NSA is still tracking you. They just can't show it right now.",
  "Offline. Please check if your router is actually plugged in, or if you're just trying to save electricity.",
  "We checked our servers, we checked the cloud, we checked the code. Yep, the problem is definitely your WiFi.",
  "No signal. Have you tried blowing into your ethernet port? Used to work for Nintendo cartridges.",
  "Offline. It's fine, the internet was full of spoilers anyway. Go read a book. Or sleep.",
  "Offline. Please wait while we search for a stable signal... Just kidding, we aren't searching. Go fix it.",
  "No internet. If you are reading this, congrats. Your screen still works. Your network provider doesn't.",
  "Offline. Please contact your ISP and ask them why they hate you so much.",
  "No connection. Go do some push-ups. Your posture needs it anyway."
];

export default function OfflinePage() {
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Select a random message only on the client side to avoid Next.js SSR hydration mismatch
    const randomIndex = Math.floor(Math.random() * offlineMessages.length);
    setMessage(offlineMessages[randomIndex]);
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <main className={styles.container}>
      <div className={styles.logoPulse}>
        <Logo forceVersion="icon" />
      </div>

      <div className={styles.errorBox}>
        <span className={styles.statusLabel}>[ Connection Offline ]</span>
        <p className={styles.message}>{message}</p>
        
        <button className={styles.retryBtn} onClick={handleRetry}>
          Retry Connection
        </button>
      </div>
    </main>
  );
}
