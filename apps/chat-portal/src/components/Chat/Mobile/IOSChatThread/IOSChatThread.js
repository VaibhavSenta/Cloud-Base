/* Copyright (c) 2026 Vaibhav Senta. All Rights Reserved. */
'use client';

import { useRef, useEffect } from 'react';
import styles from './IOSChatThread.module.css';

/**
 * IOSChatThread — Active chat conversation thread view.
 * Renders message bubbles, delivery status indicators, typing wave animation,
 * request banners, and the glass input bar.
 *
 * All message state, send/receive logic, socket listeners, and typing
 * debounce remain in ChatScreenMobile.
 */
export default function IOSChatThread({
  activeConv,
  messages,
  localProfile,
  text,
  onTextChange,
  onSendMessage,
  partnerTyping,
  isConnected,
  onAcceptRequest,
  onRejectRequest,
  onCancelRequest,
  messagesEndRef
}) {
  return (
    <div className={styles.chatContainer}>
      {/* Opt-In Message Request Banner (Incoming) */}
      {activeConv.status === 'pending' && String(activeConv.requestedBy) !== String(localProfile.userId) && (
        <div className={styles.requestBanner}>
          <div className={styles.requestTitle}>Message Request</div>
          <div className={styles.requestSubtitle}>
            @{activeConv.partner?.chatUsername} wants to start a chat with you.
          </div>
          <div className={styles.requestActions}>
            <button className={styles.textBtnPrimary} onClick={() => onAcceptRequest(activeConv)}>
              Accept Request
            </button>
            <button className={styles.textBtnDanger} onClick={() => onRejectRequest(activeConv)}>
              Decline
            </button>
          </div>
        </div>
      )}

      {/* Sent Request Pending Banner */}
      {activeConv.status === 'pending' && String(activeConv.requestedBy) === String(localProfile.userId) && (
        <div className={styles.requestBanner}>
          <div className={styles.requestTitle}>Request Pending</div>
          <div className={styles.requestSubtitle}>
            Waiting for @{activeConv.partner?.chatUsername} to accept your request.
          </div>
          <div className={styles.requestActions}>
            <button className={styles.textBtnDanger} onClick={() => onCancelRequest(activeConv)}>
              Cancel Request
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
      <form onSubmit={onSendMessage} className={styles.inputBar}>
        <input
          type="text"
          placeholder={activeConv.status === 'pending' ? 'Message request pending...' : 'Type message...'}
          className={styles.inputField}
          value={text}
          onChange={onTextChange}
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
  );
}
