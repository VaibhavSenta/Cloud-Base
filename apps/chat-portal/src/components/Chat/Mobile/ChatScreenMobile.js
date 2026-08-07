'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import api from '@/utils/api';
import {
  getConversationKeys,
  startKeyRotationTimer,
  stopKeyRotationTimer,
  applyIncomingKeyRotation,
  encryptMessagePayload,
  decryptMessagePayload
} from '@/utils/security/keyRotationEngine';
import styles from './ChatScreenMobile.module.css';

export default function ChatScreenMobile({
  profile,
  token,
  socket,
  isConnected,
  sendTypingStatus,
  sendKeyRotation
}) {
  const [activeTab, setActiveTab] = useState('inbox'); // 'inbox', 'search'
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);

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

      // Decrypt messages on-the-fly
      const decryptedMsgs = rawMsgs.map(m => ({
        ...m,
        decryptedText: decryptMessagePayload(m.encryptedPayload, convId)
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

  // Select conversation
  const handleSelectConversation = (conv) => {
    setActiveConv(conv);
    fetchMessages(conv.conversationId);

    // Start 2-minute key rotation timer if active & partner public key present
    if (conv.status === 'active' && conv.partner?.publicKey) {
      startKeyRotationTimer(
        conv.conversationId,
        conv.partner.publicKey,
        ({ conversationId, encryptedKeyEnvelope, keyVersion }) => {
          sendKeyRotation(conv.partner.userId, conversationId, encryptedKeyEnvelope, keyVersion);
        }
      );
    }
  };

  // Cleanup key rotation timer on unmount / conv change
  useEffect(() => {
    return () => {
      if (activeConv) {
        stopKeyRotationTimer(activeConv.conversationId);
      }
    };
  }, [activeConv]);

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
        const decryptedText = decryptMessagePayload(newMsg.encryptedPayload, activeConv.conversationId);
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

    // Incoming Key Rotation listener (Approach B)
    const handleKeyRotation = ({ conversationId, encryptedKeyEnvelope, keyVersion }) => {
      console.log(`🔑 Key Rotation Event received for conversation ${conversationId}`);
      applyIncomingKeyRotation(conversationId, encryptedKeyEnvelope, keyVersion);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('message_status_change', handleStatusChange);
    socket.on('user_typing', handleUserTyping);
    socket.on('key_rotation_received', handleKeyRotation);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('message_status_change', handleStatusChange);
      socket.off('user_typing', handleUserTyping);
      socket.off('key_rotation_received', handleKeyRotation);
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

    // Encrypt payload with active AES key
    const encryptedPayload = encryptMessagePayload(messageText, conversationId);

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

  return (
    <div className={styles.wrapper}>
      {/* Top Header Bar */}
      <header className={styles.header}>
        <div className={styles.headerTitleGroup}>
          <h1 className={styles.headerTitle}>
            {activeConv ? activeConv.partner?.chatUsername || 'Chat' : 'Nothing Box Chat'}
          </h1>
          <span className={`${styles.statusTag} ${isConnected ? styles.statusOnline : styles.statusOffline}`}>
            {isConnected ? 'ONLINE' : 'OFFLINE'}
          </span>
        </div>

        <div className={styles.headerActions}>
          {activeConv ? (
            <button className={styles.textBtn} onClick={() => setActiveConv(null)}>
              Back to Inbox
            </button>
          ) : (
            <button 
              className={styles.textBtnPrimary} 
              onClick={() => setActiveTab(activeTab === 'inbox' ? 'search' : 'inbox')}
            >
              {activeTab === 'inbox' ? 'Find User' : 'Inbox'}
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      {!activeConv ? (
        <>
          {/* Search Tab (Exact Username Privacy Rule) */}
          {activeTab === 'search' && (
            <section className={styles.searchSection}>
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

              {searchError && <div style={{ color: '#ff453a', fontSize: '0.72rem', marginTop: '4px' }}>{searchError}</div>}

              {searchResult && (
                <div 
                  className={styles.conversationItem} 
                  style={{ marginTop: '10px', borderRadius: '12px', background: '#080808' }}
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
            </section>
          )}

          {/* Conversations List / Inbox */}
          <section className={styles.conversationList}>
            {conversations.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#555', fontSize: '0.8rem' }}>
                No active chats yet. Click "Find User" to start messaging.
              </div>
            ) : (
              conversations.map(conv => (
                <div 
                  key={conv.conversationId} 
                  className={styles.conversationItem}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div>
                    <div className={styles.convUsername}>
                      @{conv.partner?.chatUsername || 'User'}
                    </div>
                    <div className={styles.convSnippet}>
                      {conv.status === 'pending' ? 'Message Request Pending' : 'Tap to open chat'}
                    </div>
                  </div>

                  {conv.status === 'pending' && (
                    <span className={styles.badgeRequest}>Request</span>
                  )}
                </div>
              ))
            )}
          </section>
        </>
      ) : (
        /* Chat Thread View */
        <section className={styles.chatContainer}>
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
                    {/* Delivered State 1px line indicator above bubble with 1px gap */}
                    {isMine && msg.status === 'delivered' && (
                      <div className={styles.deliveredLine} />
                    )}

                    <div className={`
                      ${styles.bubble} 
                      ${isMine ? styles.bubbleSent : styles.bubbleReceived}
                      ${isMine && msg.status === 'sent' ? styles.bubbleStateSent : ''}
                    `}>
                      {/* Send Failed Red Dot Indicator */}
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

          {/* Typing Indicator (2 Horizontal Wave Dots) */}
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
        </section>
      )}
    </div>
  );
}
