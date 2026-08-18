import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { AuthStore } from '../services/authStore.js';

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
});

/**
 * Hook to access the Socket.IO instance and connection status.
 */
export const useSocket = (): SocketContextValue => useContext(SocketContext);

interface SocketProviderProps {
  children: React.ReactNode;
}

/**
 * SocketProvider establishes a Socket.IO connection using the current
 * user's JWT token for authentication. It auto-reconnects on token changes
 * and cleans up on unmount.
 */
export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const session = AuthStore.getSession();
    if (!session?.token) return;

    // Determine the Socket.IO server URL (same as API base, minus the /api path)
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
    const serverUrl = apiUrl.replace(/\/api\/?$/, '');

    const socket = io(serverUrl, {
      auth: { token: session.token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      console.log('[Socket.IO] ✅ Connected:', socket.id);
      setIsConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket.IO] ❌ Disconnected:', reason);
      setIsConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Socket.IO] Connection error:', err.message);
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setIsConnected(false);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
