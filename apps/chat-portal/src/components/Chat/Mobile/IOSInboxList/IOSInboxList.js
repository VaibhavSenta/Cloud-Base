/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import styles from './IOSInboxList.module.css';

/**
 * IOSInboxList — Grouped inset conversation cards for the inbox view.
 * Renders the filtered conversations list with avatars, display names,
 * last message snippets, timestamps, and unread indicators.
 *
 * All state management, filtering logic, and conversation selection
 * handlers remain in ChatScreenMobile.
 */
export default function IOSInboxList({
  filteredConversations,
  onSelectConversation,
  localProfile,
  chatFilter
}) {
  if (filteredConversations.length === 0) {
    return (
      <div className={styles.emptyState}>
        {chatFilter === 'requests'
          ? 'No message requests.'
          : 'No active chats yet. Go to "Search" to find users.'}
      </div>
    );
  }

  return (
    <div className={styles.conversationList}>
      {filteredConversations.map((conv, index) => {
        const initials = (conv.partner?.chatUsername || 'U').substring(0, 2).toUpperCase();
        const timeText = conv.lastMessageTimestamp
          ? new Date(conv.lastMessageTimestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
          : 'Tap to open';

        // Determine if the last message is unread (not from me and not yet read)
        const isMine = conv.lastMessage && String(conv.lastMessage.senderId) === String(localProfile?.userId);
        const isUnread = conv.status === 'active' && conv.lastMessage && !isMine && conv.lastMessage.status !== 'read';

        return (
          <div key={conv.conversationId}>
            <div
              className={styles.conversationItem}
              onClick={() => onSelectConversation(conv)}
            >
              <div className={styles.avatarContainer}>
                {conv.partner?.avatarUrl ? (
                  <img src={conv.partner.avatarUrl} alt="Avatar" className={styles.avatar} />
                ) : (
                  <div className={styles.initialsAvatar}>{initials}</div>
                )}
              </div>

              <div className={styles.convMeta}>
                <div className={styles.convUsername}>
                  @{conv.partner?.chatUsername || 'User'}
                </div>
                <div className={`${styles.convSnippet} ${isUnread ? styles.convSnippetUnread : ''}`}>
                  {conv.status === 'pending' ? 'Message Request Pending' : 'Tap to open chat'}
                </div>
              </div>

              <div className={styles.convRight}>
                <div className={styles.timeText}>{timeText}</div>
                <div className={styles.infoBtn} onClick={(e) => {
                  e.stopPropagation();
                  console.log('Info clicked for:', conv.conversationId);
                }}>i</div>
              </div>
            </div>
            {index < filteredConversations.length - 1 && (
              <div className={styles.separator} />
            )}
          </div>
        );
      })}
    </div>
  );
}
