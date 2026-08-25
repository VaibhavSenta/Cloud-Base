/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/utils/api';
import styles from './ChatScreenDesktop.module.css';
import { config } from '@/utils/config';
import { initPushNotifications, isPushSubscribed, unsubscribePushNotifications } from '@/utils/pushNotifications';

export default function ChatScreenDesktop({
  profile,
  token,
  socket,
  isConnected,
  sendTypingStatus,
  sendKeyRotation
}) {
  const [localProfile, setLocalProfile] = useState(profile || {});
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeTab, setActiveTab] = useState('chats'); // 'chats' | 'search' | 'friends' | 'settings'
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Push Notifications state
  const [pushEnabled, setPushEnabled] = useState(false);
  const [isTogglingPush, setIsTogglingPush] = useState(false);

  // Edit Profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState(profile?.firstName || '');
  const [editLastName, setEditLastName] = useState(profile?.lastName || '');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

  const messagesEndRef = useRef(null);

  // Scroll messages stream to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check push subscription status when opening settings tab
  useEffect(() => {
    if (activeTab === 'settings') {
      isPushSubscribed().then(setPushEnabled);
    }
  }, [activeTab]);

  const handleTogglePushNotifications = async () => {
    setIsTogglingPush(true);
    try {
      if (pushEnabled) {
        await unsubscribePushNotifications();
        setPushEnabled(false);
      } else {
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'denied') {
          alert('Notification permission is currently BLOCKED in your browser. Click the lock/tune icon in the URL bar to allow notifications for this site.');
          setIsTogglingPush(false);
          return;
        }

        const success = await initPushNotifications();
        setPushEnabled(success);

        if (!success && typeof window !== 'undefined' && !window.isSecureContext) {
          alert('Browser Security Notice: Web Push Notifications require a Secure Origin (HTTPS or http://localhost:3003).');
        }
      }
    } catch (err) {
      console.error('Failed to toggle push notifications:', err);
    } finally {
      setIsTogglingPush(false);
    }
  };

  // Fetch initial conversations list
  useEffect(() => {
    let isMounted = true;
    const fetchConversations = async () => {
      try {
        const response = await api.get('/chat/conversations/list');
        if (isMounted && response.data?.conversations) {
          setConversations(response.data.conversations);
        }
      } catch (err) {
        console.error('Failed to fetch conversations:', err);
      }
    };
    fetchConversations();
    return () => { isMounted = false; };
  }, []);

  // Handle Socket Events
  useEffect(() => {
    if (!socket) return;

    socket.on('new_message', (incomingMessage) => {
      if (activeConversation && String(incomingMessage.conversationId) === String(activeConversation._id)) {
        setMessages((prev) => [...prev, incomingMessage]);
      }
      setConversations((prev) =>
        prev.map((c) =>
          String(c._id) === String(incomingMessage.conversationId)
            ? { ...c, lastMessage: incomingMessage.text, updatedAt: new Date().toISOString() }
            : c
        )
      );
    });

    socket.on('friend_request_received', ({ conversation }) => {
      setConversations((prev) => [conversation, ...prev]);
    });

    socket.on('friend_request_accepted', ({ conversation }) => {
      setConversations((prev) =>
        prev.map((c) => (String(c._id) === String(conversation._id) ? conversation : c))
      );
      if (activeConversation && String(activeConversation._id) === String(conversation._id)) {
        setActiveConversation(conversation);
      }
    });

    return () => {
      socket.off('new_message');
      socket.off('friend_request_received');
      socket.off('friend_request_accepted');
    };
  }, [socket, activeConversation]);

  // Select conversation & fetch messages history
  const handleSelectConversation = async (conv) => {
    setActiveConversation(conv);
    setActiveTab('chats');
    try {
      const res = await api.get(`/chat/conversations/${conv._id}/messages`);
      if (res.data?.messages) {
        setMessages(res.data.messages);
      }
    } catch (err) {
      console.error('Failed to fetch messages history:', err);
    }
  };

  // Send Message
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConversation || !socket) return;

    const messageData = {
      conversationId: activeConversation._id,
      text: newMessage.trim()
    };

    socket.emit('send_message', messageData);
    setNewMessage('');
  };

  // Search User
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;

    setIsSearching(true);
    setSearchError('');
    setSearchResult(null);
    setActiveTab('search');

    try {
      const response = await api.get(`/chat/users/search?username=${encodeURIComponent(searchUsername.trim())}`);
      setSearchResult(response.data);
    } catch (err) {
      setSearchError(err.response?.data?.error || 'User lookup failed.');
    } finally {
      setIsSearching(false);
    }
  };

  // Send Friend Request
  const handleInitiateRequest = async (targetUsername) => {
    try {
      const response = await api.post('/chat/conversations/initiate', { targetUsername });
      const { conversation } = response.data;
      setConversations((prev) => [conversation, ...prev]);
      if (searchResult) {
        setSearchResult((prev) => ({ ...prev, conversation }));
      }
    } catch (err) {
      console.error('Failed to send friend request:', err);
    }
  };

  // Accept Friend Request
  const handleAcceptRequest = async (conv) => {
    try {
      const response = await api.post(`/chat/conversations/${conv._id}/accept`);
      const { conversation } = response.data;
      setConversations((prev) =>
        prev.map((c) => (String(c._id) === String(conversation._id) ? conversation : c))
      );
      if (activeConversation && String(activeConversation._id) === String(conversation._id)) {
        setActiveConversation(conversation);
      }
    } catch (err) {
      console.error('Failed to accept request:', err);
    }
  };

  // Decline Friend Request
  const handleRejectRequest = async (conv) => {
    try {
      await api.post(`/chat/conversations/${conv._id}/reject`);
      setConversations((prev) => prev.filter((c) => String(c._id) !== String(conv._id)));
      if (activeConversation && String(activeConversation._id) === String(conv._id)) {
        setActiveConversation(null);
      }
    } catch (err) {
      console.error('Failed to decline request:', err);
    }
  };

  return (
    <div className={styles.desktopContainer}>
      {/* COLUMN 1: Leftmost App Navigation Rail (240px) */}
      <div className={styles.colNavRail}>
        <div className={styles.railTopSection}>
          {/* macOS Traffic Light Controls */}
          <div className={styles.macTrafficLights}>
            <span className={styles.macDotRed}></span>
            <span className={styles.macDotYellow}></span>
            <span className={styles.macDotGreen}></span>
          </div>

            <div className={styles.railBrandHeader}>
              <span className={styles.railBrandTitle}>Nothingbox</span>
            </div>

          <div className={styles.railUserCard} onClick={() => setActiveTab('settings')}>
            {localProfile.avatarUrl ? (
              <img src={localProfile.avatarUrl} alt="Avatar" className={styles.railAvatar} />
            ) : (
              <div className={styles.streamAvatarPlaceholder}>
                <img src="/profile-icon.svg" alt="Default Avatar" className={styles.defaultUserIcon} />
              </div>
            )}
            <div className={styles.railUserMeta}>
              <span className={styles.railUserName}>{localProfile.firstName || localProfile.chatUsername}</span>
              <span className={styles.railUserTag}>{localProfile.chatUsername}</span>
            </div>
          </div>

          <div className={styles.railMenu}>
            <button
              className={`${styles.railMenuBtn} ${activeTab === 'chats' ? styles.railMenuBtnActive : ''}`}
              onClick={() => setActiveTab('chats')}
            >
              Chats Stream
            </button>
            <button
              className={`${styles.railMenuBtn} ${activeTab === 'friends' ? styles.railMenuBtnActive : ''}`}
              onClick={() => setActiveTab('friends')}
            >
              Friend Requests
            </button>
            <button
              className={`${styles.railMenuBtn} ${activeTab === 'settings' ? styles.railMenuBtnActive : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              App Settings
            </button>
          </div>
        </div>

        <div className={styles.railStatusCard}>
          <span className={isConnected ? styles.onlineDot : styles.offlineDot}></span>
          <span>{isConnected ? 'Connected to Socket' : 'Connecting...'}</span>
        </div>
      </div>

      {/* COLUMN 2: Middle Stream & Search Panel (340px) */}
      <div className={styles.colMiddlePanel}>
        <div className={styles.middleSearchArea}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <input
              type="text"
              value={searchUsername}
              onChange={(e) => setSearchUsername(e.target.value)}
              placeholder="Search @username..."
              className={styles.searchInput}
            />
            <button type="submit" className={styles.searchBtn} disabled={isSearching}>
              {isSearching ? '...' : 'Search'}
            </button>
          </form>
          {searchError && <div style={{ color: '#8e8e93', fontSize: '0.75rem' }}>{searchError}</div>}
        </div>

        <span className={styles.middleHeaderTitle}>
          {activeTab === 'chats' && 'Active Conversations'}
          {activeTab === 'friends' && 'Friend Requests'}
          {activeTab === 'search' && 'User Lookup Result'}
          {activeTab === 'settings' && 'Account Settings'}
        </span>

        <div className={styles.middleStreamList}>
          {activeTab === 'search' && searchResult && (
            <div className={styles.streamCard} style={{ marginBottom: '12px' }}>
              <div className={styles.streamLeft}>
                <div className={styles.streamAvatarPlaceholder}>
                  <img src="/profile-icon.svg" alt="User" className={styles.defaultUserIcon} />
                </div>
                <div className={styles.streamMeta}>
                  <span className={styles.streamName}>{searchResult.targetUser.chatUsername}</span>
                  <span className={styles.streamSnippet}>
                    {searchResult.conversation ? searchResult.conversation.status : 'Not connected'}
                  </span>
                </div>
              </div>
              {!searchResult.conversation ? (
                <button className={styles.textBtnPrimary} onClick={() => handleInitiateRequest(searchResult.targetUser.chatUsername)}>
                  Add Friend
                </button>
              ) : searchResult.conversation.status === 'active' ? (
                <button className={styles.textBtnPrimary} onClick={() => handleSelectConversation(searchResult.conversation)}>
                  Chat
                </button>
              ) : (
                <button className={styles.textBtnPrimary} disabled style={{ opacity: 0.6 }}>
                  Requested
                </button>
              )}
            </div>
          )}

          {activeTab === 'chats' && conversations.filter((c) => c.status === 'active').length === 0 && (
            <div style={{ color: '#8e8e93', fontSize: '0.8rem', textAlign: 'center', marginTop: '30px' }}>
              No active conversations yet.
            </div>
          )}

          {activeTab === 'chats' &&
            conversations
              .filter((c) => c.status === 'active')
              .map((c) => {
                const partner = c.participants?.find((p) => String(p.userId) !== String(localProfile.userId)) || {};
                const isSelected = activeConversation && String(activeConversation._id) === String(c._id);
                return (
                  <div
                    key={c._id}
                    className={`${styles.streamCard} ${isSelected ? styles.streamCardActive : ''}`}
                    onClick={() => handleSelectConversation({ ...c, partner })}
                  >
                    <div className={styles.streamLeft}>
                      {partner.avatarUrl ? (
                        <img src={partner.avatarUrl} alt="Avatar" className={styles.streamAvatar} />
                      ) : (
                        <div className={styles.streamAvatarPlaceholder}>
                          <img src="/profile-icon.svg" alt="User" className={styles.defaultUserIcon} />
                        </div>
                      )}
                      <div className={styles.streamMeta}>
                        <span className={styles.streamName}>{partner.chatUsername || 'Friend'}</span>
                        <span className={styles.streamSnippet}>{c.lastMessage || 'Connected'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}

          {activeTab === 'friends' &&
            conversations
              .filter((c) => c.status === 'pending')
              .map((c) => {
                const isIncoming = String(c.requestedBy) !== String(localProfile.userId);
                const partner = c.participants?.find((p) => String(p.userId) !== String(localProfile.userId)) || {};
                return (
                  <div key={c._id} className={styles.streamCard}>
                    <div className={styles.streamLeft}>
                      <div className={styles.streamAvatarPlaceholder}>
                        <img src="/profile-icon.svg" alt="User" className={styles.defaultUserIcon} />
                      </div>
                      <div className={styles.streamMeta}>
                        <span className={styles.streamName}>{partner.chatUsername || 'User'}</span>
                        <span className={styles.streamSnippet}>{isIncoming ? 'Incoming Request' : 'Sent Request'}</span>
                      </div>
                    </div>
                    {isIncoming ? (
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className={styles.textBtnPrimary} onClick={() => handleAcceptRequest(c)}>
                          Accept
                        </button>
                        <button className={styles.textBtnDanger} onClick={() => handleRejectRequest(c)}>
                          Decline
                        </button>
                      </div>
                    ) : (
                      <button className={styles.textBtnPrimary} disabled style={{ opacity: 0.6 }}>
                        Requested
                      </button>
                    )}
                  </div>
                );
              })}
        </div>
      </div>

      {/* COLUMN 3: Right Main Workspace Panel (Flex-1) */}
      <div className={styles.colMainWorkspace}>
        {activeTab === 'settings' ? (
          /* SETTINGS WORKSPACE */
          <div className={styles.desktopSettingsContainer}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginBottom: '28px' }}>
              <div style={{ width: '96px', height: '96px', borderRadius: '50%', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.12)', backgroundColor: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {localProfile.avatarUrl ? (
                  <img src={localProfile.avatarUrl} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img src="/profile-icon.svg" alt="Default Avatar" className={styles.defaultUserIcon} style={{ width: '48px', height: '48px' }} />
                )}
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {localProfile.firstName} {localProfile.lastName}
              </h3>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#8e8e93', backgroundColor: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: '4px 16px', borderRadius: '20px' }}>
                {localProfile.chatUsername}
              </span>
            </div>

            {/* GROUP 1: ACCOUNT DETAILS */}
            <div className={styles.appleGroupSection}>
              <span className={styles.appleGroupTitle}>Account Details</span>
              <div className={styles.appleGroupCard}>
                <div className={styles.appleRow}>
                  <span className={styles.appleRowLabel}>Display Name</span>
                  <span className={styles.appleRowValue}>{localProfile.firstName} {localProfile.lastName}</span>
                </div>
                <div className={styles.appleRow}>
                  <span className={styles.appleRowLabel}>Chat Username</span>
                  <span className={styles.appleRowValue}>{localProfile.chatUsername}</span>
                </div>
                <div className={styles.appleRow}>
                  <span className={styles.appleRowLabel}>Email Address</span>
                  <span className={styles.appleRowValue}>{localProfile.email || 'None'}</span>
                </div>
              </div>
            </div>

            {/* GROUP 2: PREFERENCES */}
            <div className={styles.appleGroupSection}>
              <span className={styles.appleGroupTitle}>Preferences</span>
              <div className={styles.appleGroupCard}>
                <div className={styles.appleRow}>
                  <span className={styles.appleRowLabel}>Push Notifications</span>
                  <button
                    className={`${styles.pushToggleBtn} ${pushEnabled ? styles.pushToggleBtnActive : ''}`}
                    onClick={handleTogglePushNotifications}
                    disabled={isTogglingPush}
                  >
                    {isTogglingPush ? '...' : (pushEnabled ? 'ON' : 'OFF')}
                  </button>
                </div>
              </div>
            </div>

            {/* GROUP 3: SECURITY & MANAGEMENT */}
            <div className={styles.appleGroupSection}>
              <span className={styles.appleGroupTitle}>Account Management</span>
              <div className={styles.appleGroupCard}>
                <div className={styles.appleRow}>
                  <a href={`${config.accountPortalUrl}/dashboard`} target="_blank" rel="noreferrer" className={styles.appleRowActionBtn} style={{ textDecoration: 'none' }}>
                    <span className={styles.appleActionLabel}>Manage Security & 2FA</span>
                  </a>
                </div>
              </div>
            </div>

            {/* GROUP 4: SESSION LOGOUT */}
            <div className={styles.appleGroupSection}>
              <div className={styles.appleGroupCardDanger}>
                <button
                  onClick={() => {
                    document.cookie = 'token=; domain=localhost; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                    window.location.reload();
                  }}
                  className={styles.appleDangerRowBtn}
                >
                  Logout Account
                </button>
              </div>
            </div>
          </div>
        ) : activeConversation ? (
          /* ACTIVE CHAT WORKSPACE */
          <>
            <div className={styles.workspaceChatHeader}>
              <div className={styles.partnerInfo}>
                {activeConversation.partner?.avatarUrl ? (
                  <img src={activeConversation.partner.avatarUrl} alt="Avatar" className={styles.partnerAvatar} />
                ) : (
                  <div className={styles.streamAvatarPlaceholder}>
                    <img src="/profile-icon.svg" alt="User" className={styles.defaultUserIcon} />
                  </div>
                )}
                <div className={styles.partnerMeta}>
                  <span className={styles.partnerName}>{activeConversation.partner?.chatUsername || 'Friend'}</span>
                  <span className={styles.partnerStatus}>
                    <span className={isConnected ? styles.onlineDot : styles.offlineDot}></span>
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>

            <div className={styles.messagesStream}>
              {messages.map((m, idx) => {
                const isSentByMe = String(m.senderId) === String(localProfile.userId);
                return (
                  <div key={m._id || idx} className={isSentByMe ? styles.bubbleSent : styles.bubbleReceived}>
                    <div>{m.text}</div>
                    <span className={styles.timestamp}>
                      {new Date(m.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className={styles.chatInputWrapper}>
              <form onSubmit={handleSendMessage} className={styles.chatInputArea}>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className={styles.msgInput}
                />
                <button type="submit" className={styles.sendBtn} disabled={!newMessage.trim()}>
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          /* PRO EMPTY WORKSPACE */
          <div className={styles.emptyState}>
            <span className={styles.emptyTitle}>Nothingbox Chat Pro</span>
            <span className={styles.emptySubtitle}>Select a conversation or search a username to start messaging.</span>
          </div>
        )}
      </div>
    </div>
  );
}
