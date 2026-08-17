/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/utils/api';
import { config } from '@/utils/config';
import styles from './ChatScreenMobile.module.css';
import Footer from '@/components/Footer/Footer';

export default function ChatScreenMobile({
  profile,
  token,
  socket,
  isConnected,
  sendTypingStatus,
  sendKeyRotation
}) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'search', 'settings'
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState([]);
  const [chatFilter, setChatFilter] = useState('all'); // 'all', 'requests'
  const [chatSearchText, setChatSearchText] = useState('');

  const messagesEndRef = useRef(null);
  const typingDebounceRef = useRef(null);

  // Auto-scroll to bottom of chat thread
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversations list
  const fetchConversations = useCallback(async () => {
    try {
      const res = await api.get('/chat/conversations/list');
      setConversations(res.data.conversations || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Load messages when an active conversation is selected
  const fetchMessages = useCallback(async (convId) => {
    try {
      const res = await api.get(`/chat/messages/conversation/${convId}`);
      const rawMsgs = res.data.messages || [];

      // Plaintext dev bypass: render payload directly
      const decryptedMsgs = rawMsgs.map(m => ({
        ...m,
        decryptedText: m.encryptedPayload
      }));

      setMessages(decryptedMsgs);
      setTimeout(scrollToBottom, 50);

      // Auto-mark unread messages as read
      const unreadIds = rawMsgs
        .filter(m => String(m.receiverId) === String(profile?.userId) && m.status !== 'read')
        .map(m => m.messageId);

      if (unreadIds.length > 0) {
        await api.post('/chat/messages/status', { messageIds: unreadIds, status: 'read' });
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, [profile?.userId]);

  const syncOfflineQueue = useCallback(async () => {
    if (offlineQueue.length === 0) return;

    console.log(`🔄 [OfflineSync] Syncing ${offlineQueue.length} offline messages...`);
    const queueCopy = [...offlineQueue];

    for (const msg of queueCopy) {
      try {
        await api.post('/chat/messages/send', {
          messageId: msg.messageId,
          conversationId: msg.conversationId,
          receiverId: msg.receiverId,
          encryptedPayload: msg.encryptedPayload
        });

        // Update status in UI to 'sent'
        setMessages(prev => prev.map(m => m.messageId === msg.messageId ? { ...m, status: 'sent' } : m));

        // Remove from queue
        setOfflineQueue(prev => prev.filter(m => m.messageId !== msg.messageId));
      } catch (err) {
        console.error(`❌ [OfflineSync] Failed to sync message ${msg.messageId}:`, err.message);
        break; // Stop loop to preserve order and retry later
      }
    }
  }, [offlineQueue]);

  // Trigger offline queue sync upon connection status changes
  useEffect(() => {
    if (isConnected && offlineQueue.length > 0) {
      syncOfflineQueue();
    }
  }, [isConnected, offlineQueue.length, syncOfflineQueue]);

  useEffect(() => {
    const handleOnline = () => {
      if (offlineQueue.length > 0) {
        syncOfflineQueue();
      }
    };
    window.addEventListener('online', handleOnline);
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [offlineQueue.length, syncOfflineQueue]);

  // Select conversation
  const handleSelectConversation = (conv) => {
    setActiveConv(conv);
    fetchMessages(conv.conversationId);
  };

  // Socket Event Listeners for real-time messages & status
  useEffect(() => {
    if (!socket) return;

    // Real-time message listener
    const handleNewMessage = (newMsg) => {
      console.log('📩 Socket new_message received:', newMsg);

      // Refresh conversations list to update snippets
      fetchConversations();

      // If message belongs to current open conversation, append it
      if (activeConv && String(newMsg.conversationId) === String(activeConv.conversationId)) {
        const decryptedText = newMsg.encryptedPayload;
        setMessages(prev => [...prev, { ...newMsg, decryptedText }]);
        setTimeout(scrollToBottom, 50);

        // Mark as read
        api.post('/chat/messages/status', { messageIds: [newMsg.messageId], status: 'read' });
      }
    };

    // Real-time message status updates (sent -> delivered -> read)
    const handleStatusChange = ({ messageId, status }) => {
      setMessages(prev => prev.map(m => m.messageId === messageId ? { ...m, status } : m));
    };

    // Typing status listener
    const handleUserTyping = ({ senderId, conversationId, isTyping }) => {
      if (activeConv && String(conversationId) === String(activeConv.conversationId)) {
        setPartnerTyping(isTyping);
      }
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_status_change', handleStatusChange);
    socket.on('user_typing', handleUserTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_status_change', handleStatusChange);
      socket.off('user_typing', handleUserTyping);
    };
  }, [socket, activeConv, fetchConversations]);

  // Handle Exact Username Search (Privacy Rule: Strict Full Match Only)
  const handleSearchUser = async (e) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;

    setIsSearching(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const res = await api.post('/chat/conversations/initiate', {
        targetUsername: searchUsername.trim()
      });

      setSearchResult(res.data);
    } catch (err) {
      setSearchError(err.response?.data?.error || 'User not found. Exact match required.');
    } finally {
      setIsSearching(false);
    }
  };

  // Handle Message Input Change & Typing Broadcast
  const handleTextChange = (e) => {
    const val = e.target.value;
    setText(val);

    if (activeConv && activeConv.partner) {
      sendTypingStatus(activeConv.partner.userId, activeConv.conversationId, true);

      if (typingDebounceRef.current) clearTimeout(typingDebounceRef.current);
      typingDebounceRef.current = setTimeout(() => {
        sendTypingStatus(activeConv.partner.userId, activeConv.conversationId, false);
      }, 1500);
    }
  };

  // Handle Send Message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeConv) return;

    const messageText = text.trim();
    setText('');

    // Stop typing indicator broadcast
    if (activeConv.partner) {
      sendTypingStatus(activeConv.partner.userId, activeConv.conversationId, false);
    }

    const messageId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const conversationId = activeConv.conversationId;
    const receiverId = activeConv.partner?.userId;

    // Plaintext dev bypass: payload contains raw text
    const encryptedPayload = messageText;

    // Optimistic UI update
    const newMsgObj = {
      messageId,
      conversationId,
      senderId: profile.userId,
      receiverId,
      encryptedPayload,
      decryptedText: messageText,
      status: 'sent',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, newMsgObj]);
    setTimeout(scrollToBottom, 50);

    try {
      await api.post('/chat/messages/send', {
        messageId,
        conversationId,
        receiverId,
        encryptedPayload
      });
    } catch (err) {
      console.error('Failed to send message:', err);
      setMessages(prev => prev.map(m => m.messageId === messageId ? { ...m, status: 'failed' } : m));
      setOfflineQueue(prev => [...prev, newMsgObj]);
    }
  };

  // Handle Accept Message Request
  const handleAcceptRequest = async () => {
    if (!activeConv) return;
    try {
      await api.post(`/chat/conversations/${activeConv.conversationId}/accept`);
      setActiveConv(prev => ({ ...prev, status: 'active' }));
      fetchConversations();
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    // Filter by search text
    if (chatSearchText.trim()) {
      const username = (conv.partner?.chatUsername || '').toLowerCase();
      return username.includes(chatSearchText.trim().toLowerCase());
    }
    return true;
  });

  return (
    <div className={styles.wrapper}>
      {/* 1. HEADER BAR */}
      <header className={styles.header} style={(!activeConv && activeTab === 'chat') ? { flexDirection: 'column', alignItems: 'stretch', gap: '10px' } : {}}>
        {activeConv ? (
          <>
            <div className={styles.headerLeft}>
              <button className={styles.backBtn} onClick={() => setActiveConv(null)}>
                Back
              </button>
            </div>

            <h1 className={styles.headerTitle}>
              @{activeConv.partner?.chatUsername || 'User'}
            </h1>

            <div className={styles.headerRight}>
              <button className={styles.moreBtn} onClick={() => console.log('More options clicked')}>
                ...
              </button>
            </div>
          </>
        ) : activeTab === 'chat' ? (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h1 className={styles.largeTitle} style={{ padding: 0 }}>Chat</h1>
              <span className={`${styles.statusDot} ${isConnected ? styles.statusOnline : styles.statusOffline}`} />
            </div>

            <div className={styles.searchBarContainer} style={{ margin: 0 }}>
              <span className={styles.searchBarIcon}>🔍</span>
              <input
                type="text"
                placeholder="Search"
                className={styles.searchBarInput}
                value={chatSearchText}
                onChange={(e) => setChatSearchText(e.target.value)}
              />
            </div>
          </div>
        ) : (
          <>
            <div className={styles.headerLeft} />
            <h1 className={styles.headerTitle}>
              {activeTab === 'search' ? 'Search' : 'Settings'}
            </h1>
            <div className={styles.headerRight}>
              <span className={`${styles.statusDot} ${isConnected ? styles.statusOnline : styles.statusOffline}`} />
            </div>
          </>
        )}
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className={styles.mainContent}>
        {activeConv ? (
          /* CHAT THREAD VIEW */
          <div className={styles.chatContainer}>
            {/* Opt-In Message Request Banner */}
            {activeConv.status === 'pending' && String(activeConv.requestedBy) !== String(profile.userId) && (
              <div className={styles.requestBanner}>
                <div className={styles.requestTitle}>Message Request</div>
                <div className={styles.requestSubtitle}>
                  @{activeConv.partner?.chatUsername} wants to start a chat with you.
                </div>
                <div className={styles.requestActions}>
                  <button className={styles.textBtnPrimary} onClick={handleAcceptRequest}>
                    Accept Request
                  </button>
                </div>
              </div>
            )}

            {/* Messages Area */}
            <div className={styles.messagesList}>
              {messages.map((msg, index) => {
                const isMine = String(msg.senderId) === String(profile.userId);

                return (
                  <div 
                    key={msg.messageId || index} 
                    className={`${styles.messageRow} ${isMine ? styles.messageRowSent : styles.messageRowReceived}`}
                  >
                    <div className={styles.bubbleWrapper}>
                      {/* Delivered Line */}
                      {isMine && msg.status === 'delivered' && (
                        <div className={styles.deliveredLine} />
                      )}

                      <div className={`
                        ${styles.bubble} 
                        ${isMine ? styles.bubbleSent : styles.bubbleReceived}
                        ${isMine && msg.status === 'sent' ? styles.bubbleStateSent : ''}
                      `}>
                        {isMine && msg.status === 'failed' && (
                          <span className={styles.failedDot} title="Failed to send" />
                        )}
                        {msg.decryptedText || msg.encryptedPayload}
                      </div>
                    </div>

                    <span className={styles.timestamp}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            <div className={styles.typingContainer}>
              {partnerTyping && (
                <div className={styles.typingWave}>
                  <span className={styles.dot} />
                  <span className={styles.dot} />
                </div>
              )}
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className={styles.inputBar}>
              <input
                type="text"
                placeholder={activeConv.status === 'pending' ? 'Message request pending...' : 'Type message...'}
                className={styles.inputField}
                value={text}
                onChange={handleTextChange}
                disabled={activeConv.status === 'pending' && String(activeConv.requestedBy) !== String(profile.userId)}
              />
              <button 
                type="submit" 
                className={styles.sendBtn} 
                disabled={!text.trim() || !isConnected}
              >
                Send
              </button>
            </form>
          </div>
        ) : (
          /* MAIN TABS */
          <div className={styles.tabContainer}>
            {activeTab === 'chat' && (
              /* CONVERSATIONS LIST / INBOX (iOS Style) */
              <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%' }}>
                <div className={styles.conversationList}>
                  {filteredConversations.length === 0 ? (
                    <div className={styles.emptyState}>
                      {chatFilter === 'requests' 
                        ? 'No message requests.' 
                        : 'No active chats yet. Go to "Search" to find users.'
                      }
                    </div>
                  ) : (
                    filteredConversations.map((conv, index) => {
                      const initials = (conv.partner?.chatUsername || 'U').substring(0, 2).toUpperCase();
                      const timeText = conv.lastMessageTimestamp 
                        ? new Date(conv.lastMessageTimestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })
                        : 'Tap to open';

                      return (
                        <div key={conv.conversationId}>
                          <div 
                            className={styles.conversationItem}
                            onClick={() => handleSelectConversation(conv)}
                            style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 18px', background: 'transparent' }}
                          >
                            <div className={styles.iosAvatarContainer}>
                              {conv.partner?.avatarUrl ? (
                                <img src={conv.partner.avatarUrl} alt="Avatar" className={styles.iosAvatar} />
                              ) : (
                                <div className={styles.iosInitialsAvatar}>{initials}</div>
                              )}
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '3px' }}>
                              <div className={styles.convUsername} style={{ fontSize: '1rem', fontWeight: '700' }}>
                                @{conv.partner?.chatUsername || 'User'}
                              </div>
                              <div className={styles.convSnippet} style={{ fontSize: '0.85rem', color: '#8e8e93' }}>
                                {conv.status === 'pending' ? 'Message Request Pending' : 'Tap to open chat'}
                              </div>
                            </div>

                            <div className={styles.iosConvMeta}>
                              <div className={styles.iosTimeText}>{timeText}</div>
                              <div className={styles.iosInfoBtn} onClick={(e) => {
                                e.stopPropagation();
                                console.log('Info clicked for:', conv.conversationId);
                              }}>i</div>
                            </div>
                          </div>
                          {index < filteredConversations.length - 1 && (
                            <div className={styles.iosSeparator} />
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'search' && (
              /* SEARCH VIEW */
              <div className={styles.searchSection}>
                <form onSubmit={handleSearchUser} className={styles.searchInputGroup}>
                  <input
                    type="text"
                    placeholder="Exact username (e.g. vaibhav)"
                    className={styles.inputField}
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                  />
                  <button type="submit" className={styles.textBtnPrimary} disabled={isSearching}>
                    {isSearching ? 'Searching...' : 'Search'}
                  </button>
                </form>

                {searchError && <div className={styles.searchError}>{searchError}</div>}

                {searchResult && (
                  <div 
                    className={styles.conversationItem} 
                    style={{ marginTop: '14px', borderRadius: '16px', background: '#050505', border: '1px solid rgba(255, 255, 255, 0.05)' }}
                    onClick={() => {
                      handleSelectConversation({
                        ...searchResult.conversation,
                        partner: searchResult.targetUser
                      });
                    }}
                  >
                    <div>
                      <div className={styles.convUsername}>@{searchResult.targetUser.chatUsername}</div>
                      <div className={styles.convSnippet}>Click to open messaging thread</div>
                    </div>
                    <button className={styles.textBtnPrimary}>Chat</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'settings' && (
              /* SETTINGS VIEW */
              <div className={styles.settingsSection}>
                <div className={styles.profileCard}>
                  <div className={styles.profileMeta}>
                    <div className={styles.profileLabel}>DISPLAY NAME</div>
                    <div className={styles.profileValue}>{profile.firstName} {profile.lastName}</div>
                  </div>
                  <div className={styles.profileMeta}>
                    <div className={styles.profileLabel}>CHAT USERNAME</div>
                    <div className={styles.profileValue}>@{profile.chatUsername}</div>
                  </div>
                  <div className={styles.profileMeta}>
                    <div className={styles.profileLabel}>EMAIL ADDRESS</div>
                    <div className={styles.profileValue}>{profile.email || 'None'}</div>
                  </div>
                </div>

                <div className={styles.settingsList}>
                  <a 
                    href={`${config.accountPortalUrl}/dashboard`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className={styles.settingsLink}
                  >
                    Manage Security & 2FA ↗
                  </a>
                  <button 
                    onClick={() => {
                      // Perform clean cookie logout
                      document.cookie = "token=; domain=localhost; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                      window.location.reload();
                    }} 
                    className={styles.logoutBtn}
                  >
                    Logout Account
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* 3. FOOTER / BOTTOM BAR */}
      {!activeConv && (
        <Footer activeTab={activeTab} setActiveTab={setActiveTab} profile={profile} />
      )}
    </div>
  );
}
