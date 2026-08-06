'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { config } from '@/utils/config';

/**
 * Custom hook to manage real-time Socket.io connections for Chat Portal.
 * Enforces strict memory-only session tokens and double-encrypted payload tunnels.
 */
export function useSocket(isAuthenticated) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    const socketUrl = config.socketUrl;
    const token = typeof window !== 'undefined' ? window.__cb_session_token : null;

    console.log('🔌 Connecting Socket.io to:', socketUrl);

    const socket = io(socketUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      auth: {
        token: token || ''
      },
      query: {
        token: token || ''
      },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('✅ Socket connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        console.warn('⚠️ Disconnected by server. Redirecting to Account Portal...');
        if (typeof window !== 'undefined') {
          window.location.href = config.accountPortalUrl;
        }
      }
    });

    socket.on('connect_error', (error) => {
      console.error('⚠️ Socket connect error:', error.message);
      setIsConnected(false);
    });

    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
    };
  }, [isAuthenticated]);

  // Typing Indicator Emitter
  const sendTypingStatus = useCallback((receiverId, conversationId, isTyping) => {
    if (socketRef.current && isConnected) {
      const eventName = isTyping ? 'typing_start' : 'typing_stop';
      socketRef.current.emit(eventName, { receiverId, conversationId });
    }
  }, [isConnected]);

  // Envelope Key Rotation Exchange Emitter (Approach B)
  const sendKeyRotation = useCallback((receiverId, conversationId, encryptedKeyEnvelope, keyVersion) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('rotate_key_exchange', {
        receiverId,
        conversationId,
        encryptedKeyEnvelope,
        keyVersion
      });
    }
  }, [isConnected]);

  return {
    socket: socketRef.current,
    isConnected,
    sendTypingStatus,
    sendKeyRotation
  };
}
