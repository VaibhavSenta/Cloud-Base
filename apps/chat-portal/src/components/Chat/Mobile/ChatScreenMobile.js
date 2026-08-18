/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import api, { securePatch } from '@/utils/api';
import { config } from '@/utils/config';
import styles from './ChatScreenMobile.module.css';
import Footer from '@/components/Footer/Footer';
import Header from '@/components/Header/Header';
import { triggerHaptic } from '@/utils/haptics';

export default function ChatScreenMobile({
  profile,
  token,
  socket,
  isConnected,
  sendTypingStatus,
  sendKeyRotation
}) {
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'search', 'settings'
  const [localProfile, setLocalProfile] = useState(profile);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editFirstName, setEditFirstName] = useState(profile?.firstName || '');
  const [editLastName, setEditLastName] = useState(profile?.lastName || '');
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatarUrl || '');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState('');

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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setProfileError('File size is too large (max 2MB).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setAvatarPreview(reader.result);
      setProfileError('');
    };
    reader.onerror = () => {
      setProfileError('Failed to read file.');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    if (!editFirstName.trim()) {
      setProfileError('First name is required.');
      return;
    }

    setIsSavingProfile(true);
    setProfileError('');

    try {
      let finalAvatarUrl = localProfile.avatarUrl;

      // 1. If user selected a new custom picture (base64)
      if (avatarPreview && avatarPreview.startsWith('data:image/')) {
        console.log('🖼️ Profile: Uploading base64 image to account-api PATCH /profile...');
        const patchRes = await securePatch(`${config.accountApiUrl}/api/v1/auth/profile`, {
          firstName: editFirstName.trim(),
          lastName: editLastName.trim(),
          profilePic: avatarPreview
        });

        if (patchRes.data?.success && patchRes.data?.data) {
          const updatedUser = patchRes.data.data;
          console.log('🖼️ Profile: Upload success. Received profilePic URL:', updatedUser.profilePic);
          
          if (updatedUser.profilePic) {
            finalAvatarUrl = updatedUser.profilePic;
            
            // 2. Synchronize avatar URL to chat-api Profile collection
            console.log('🖼️ Profile: Synchronizing avatarUrl with chat-api PUT /profile/avatar...');
            await api.put('/chat/users/profile/avatar', { avatarUrl: finalAvatarUrl });
            console.log('🖼️ Profile: Avatar synchronization complete.');
          }
        } else {
          throw new Error(patchRes.data?.message || 'Profile patch failed on account-api.');
        }
      } else {
        // Just update names without picture upload
        console.log('🖼️ Profile: Updating names only...');
        const patchRes = await securePatch(`${config.accountApiUrl}/api/v1/auth/profile`, {
          firstName: editFirstName.trim(),
          lastName: editLastName.trim()
        });
        if (!patchRes.data?.success) {
          throw new Error(patchRes.data?.message || 'Failed to update display name.');
        }
      }

      // 3. Update local React state instantly
      const updatedProfile = {
        ...localProfile,
        firstName: editFirstName.trim(),
        lastName: editLastName.trim(),
        avatarUrl: finalAvatarUrl
      };
      
      setLocalProfile(updatedProfile);
      setIsEditingProfile(false);
      
    } catch (err) {
      console.error('❌ Profile update failed:', err);
      setProfileError(err.response?.data?.error || err.response?.data?.message || err.message || 'Failed to save changes.');
    } finally {
      setIsSavingProfile(false);
    }
  };

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
        .filter(m => String(m.receiverId) === String(localProfile?.userId) && m.status !== 'read')
        .map(m => m.messageId);

      if (unreadIds.length > 0) {
        await api.post('/chat/messages/status', { messageIds: unreadIds, status: 'read' });
      }
    } catch (err) {
      console.error('Failed to load messages:', err);
    }
  }, [localProfile?.userId]);

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

  const handleSearchUser = async (e) => {
    e.preventDefault();
    const cleanSearchUsername = searchUsername.replace(/@/g, '').trim().toLowerCase();
    if (!cleanSearchUsername) return;

    setIsSearching(true);
    setSearchError('');
    setSearchResult(null);

    try {
      const res = await api.post('/chat/conversations/initiate', {
        targetUsername: cleanSearchUsername
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
      senderId: localProfile.userId,
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

  // Calculate dynamic indicator badge states for bottombar tabs
  const hasChatUpdate = conversations.some(conv => {
    if (conv.status === 'active' && conv.lastMessage) {
      const isMine = String(conv.lastMessage.senderId) === String(localProfile?.userId);
      return !isMine && conv.lastMessage.status !== 'read';
    }
    return false;
  });

  const hasFriendsUpdate = conversations.some(conv => {
    return conv.status === 'pending' && String(conv.requestedBy) !== String(localProfile?.userId);
  });

  const hasGroupsUpdate = false;

  return (
    <div className={styles.wrapper}>
      {/* 1. HEADER BAR */}
      <Header
        activeConv={activeConv}
        setActiveConv={setActiveConv}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={localProfile}
        chatSearchText={chatSearchText}
        setChatSearchText={setChatSearchText}
      />

      {/* 2. MAIN CONTENT AREA */}
      <main className={styles.mainContent}>
        {activeConv ? (
          /* CHAT THREAD VIEW */
          <div className={styles.chatContainer}>
            {/* Opt-In Message Request Banner */}
            {activeConv.status === 'pending' && String(activeConv.requestedBy) !== String(localProfile.userId) && (
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
                const isMine = String(msg.senderId) === String(localProfile.userId);

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
                disabled={activeConv.status === 'pending' && String(activeConv.requestedBy) !== String(localProfile.userId)}
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
                              <div className={styles.convUsername}>
                                @{conv.partner?.chatUsername || 'User'}
                              </div>
                              <div className={styles.convSnippet}>
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

            {activeTab === 'friends' && (
              /* FRIENDS VIEW (Accepted message requests / active contacts list) */
              <div className={styles.friendsTabContainer}>
                {/* Floating Capsule Bar (iOS Find My style vertical stack) */}
                <div className={styles.verticalCapsule}>
                  <button 
                    className={styles.capsuleActionBtn} 
                    onClick={() => triggerHaptic.selection()} 
                    title="Friend Requests"
                  >
                    <img src="/friendRequests.svg" alt="Friend Requests" className={styles.capsuleIcon} />
                  </button>
                  <button 
                    className={styles.capsuleActionBtn} 
                    onClick={() => triggerHaptic.selection()} 
                    title="All Friends"
                  >
                    <img src="/allfriends.svg" alt="All Friends" className={styles.capsuleIcon} />
                  </button>
                </div>

                <div className={styles.conversationList}>
                  {conversations.filter(c => c.status === 'active').length === 0 ? (
                    <div className={styles.emptyState}>
                      No accepted friends yet. Accept a message request or chat with active users!
                    </div>
                  ) : (
                    conversations
                      .filter(c => c.status === 'active')
                      .map((conv, index, arr) => {
                        const initials = (conv.partner?.chatUsername || 'U').substring(0, 2).toUpperCase();
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
                                <div className={styles.convUsername}>
                                  @{conv.partner?.chatUsername || 'User'}
                                </div>
                                <div className={styles.convSnippet} style={{ fontSize: '0.78rem', color: '#8e8e93' }}>
                                  {conv.partner?.firstName || ''} {conv.partner?.lastName || ''}
                                </div>
                              </div>
                            </div>
                            {index < arr.length - 1 && (
                              <div className={styles.iosSeparator} />
                            )}
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            )}

            {activeTab === 'groups' && (
              /* GROUPS VIEW (Coming Soon) */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '10px', padding: '20px' }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>Groups</h2>
                <p style={{ fontSize: '0.9rem', color: '#8e8e93', margin: 0, textAlign: 'center' }}>Coming Soon</p>
              </div>
            )}

            {activeTab === 'search' && (
              /* SEARCH VIEW */
              <div className={styles.searchSection} style={{ borderBottom: 'none', background: 'transparent' }}>
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

            {activeTab === 'settings' && isEditingProfile && (
              /* EDIT PROFILE VIEW */
              <div className={styles.settingsSection}>
                <form onSubmit={handleSaveProfile} className={styles.editProfileForm}>
                  {profileError && <div className={styles.profileErrorText}>{profileError}</div>}

                  <div className={styles.avatarEditContainer}>
                    <div className={styles.avatarEditWrapper}>
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Avatar Preview" className={styles.avatarPreviewImg} />
                      ) : (
                        <div className={styles.avatarPlaceholderText}>
                          {localProfile.firstName ? localProfile.firstName[0].toUpperCase() : '?'}
                        </div>
                      )}
                      <label className={styles.avatarUploadLabel}>
                        Change
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange} 
                          className={styles.hiddenFileInput}
                        />
                      </label>
                    </div>
                  </div>

                  <div className={styles.profileEditCard}>
                    <div className={styles.editField}>
                      <label className={styles.fieldLabel}>FIRST NAME</label>
                      <input 
                        type="text" 
                        value={editFirstName} 
                        onChange={(e) => setEditFirstName(e.target.value)} 
                        className={styles.editInputField}
                        placeholder="First Name"
                      />
                    </div>
                    <div className={styles.editField} style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <label className={styles.fieldLabel}>LAST NAME</label>
                      <input 
                        type="text" 
                        value={editLastName} 
                        onChange={(e) => setEditLastName(e.target.value)} 
                        className={styles.editInputField}
                        placeholder="Last Name"
                      />
                    </div>
                  </div>

                  <div className={styles.actionButtons}>
                    <button 
                      type="button" 
                      onClick={() => {
                        setIsEditingProfile(false);
                        setEditFirstName(localProfile.firstName || '');
                        setEditLastName(localProfile.lastName || '');
                        setAvatarPreview(localProfile.avatarUrl || '');
                        setProfileError('');
                      }} 
                      className={styles.cancelBtn}
                      disabled={isSavingProfile}
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className={styles.saveBtn}
                      disabled={isSavingProfile}
                    >
                      {isSavingProfile ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'settings' && !isEditingProfile && (
              /* SETTINGS VIEW */
              <div className={styles.settingsSection}>
                <div className={styles.settingsAvatarContainer}>
                  {localProfile.avatarUrl ? (
                    <img src={localProfile.avatarUrl} alt="Avatar" className={styles.largeAvatar} />
                  ) : (
                    <div className={styles.largeAvatarPlaceholder}>
                      {localProfile.firstName ? localProfile.firstName[0].toUpperCase() : '?'}
                    </div>
                  )}
                </div>

                <div className={styles.profileCard}>
                  <div className={styles.profileMeta}>
                    <div className={styles.profileLabel}>DISPLAY NAME</div>
                    <div className={styles.profileValue}>{localProfile.firstName} {localProfile.lastName}</div>
                  </div>
                  <div className={styles.profileMeta}>
                    <div className={styles.profileLabel}>CHAT USERNAME</div>
                    <div className={styles.profileValue}>@{localProfile.chatUsername}</div>
                  </div>
                  <div className={styles.profileMeta}>
                    <div className={styles.profileLabel}>EMAIL ADDRESS</div>
                    <div className={styles.profileValue}>{localProfile.email || 'None'}</div>
                  </div>
                </div>

                <div className={styles.settingsList}>
                  <button 
                    onClick={() => {
                      setIsEditingProfile(true);
                      setEditFirstName(localProfile.firstName || '');
                      setEditLastName(localProfile.lastName || '');
                      setAvatarPreview(localProfile.avatarUrl || '');
                      setProfileError('');
                    }} 
                    className={styles.editProfileBtn}
                  >
                    Edit Profile Details
                  </button>
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
        <Footer
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          profile={localProfile}
          searchUsername={searchUsername}
          setSearchUsername={setSearchUsername}
          handleSearchUser={handleSearchUser}
          isSearching={isSearching}
          hasChatUpdate={hasChatUpdate}
          hasFriendsUpdate={hasFriendsUpdate}
          hasGroupsUpdate={hasGroupsUpdate}
        />
      )}
    </div>
  );
}
