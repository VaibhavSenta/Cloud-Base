'use client';

import BottomBar from '@/components/BottomBar/BottomBar';
import styles from './chat.module.css';

export default function StandaloneChatPage() {
  return (
    <main className={styles.container}>
      <iframe
        src="http://chat.nothingbox.site"
        className={styles.iframe}
        title="Cloud-Base Chat"
        allow="clipboard-read; clipboard-write"
      />
      <BottomBar />
    </main>
  );
}
