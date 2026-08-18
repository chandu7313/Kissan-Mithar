import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './env.js';
import { AuthUserPayload } from '../types/index.js';

let io: Server | null = null;

/**
 * Initialize Socket.IO server and attach it to the existing HTTP server.
 * Authenticates connections using the same JWT strategy as the REST API.
 */
export const initSocketIO = (httpServer: HttpServer): Server => {
  io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // JWT authentication middleware for Socket.IO connections
  io.use((socket: Socket, next) => {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers?.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication required — provide a JWT token'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as AuthUserPayload;
      (socket as any).user = decoded;
      next();
    } catch {
      return next(new Error('Invalid or expired authentication token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user as AuthUserPayload;
    console.log(
      `[Socket.IO] ✅ Connected: ${user.name || user.userId} (${user.role}) — socket ${socket.id}`
    );

    // Auto-join admin and expert rooms so they receive broadcast events
    if (user.role === 'ADMIN') {
      socket.join('room:admins');
      socket.join('room:staff'); // combined room for both admins & experts
    }
    if (user.role === 'EXPERT') {
      socket.join('room:experts');
      socket.join('room:staff');
      // Also join their personal expert room
      if (user.expertId) {
        socket.join(`expert:${user.expertId}`);
      }
    }

    socket.on('disconnect', (reason) => {
      console.log(
        `[Socket.IO] ❌ Disconnected: ${user.name || user.userId} — ${reason}`
      );
    });
  });

  console.log('[Socket.IO] 🔌 Real-time server initialized');
  return io;
};

/**
 * Get the global Socket.IO server instance.
 * Returns null if Socket.IO has not been initialized yet.
 */
export const getIO = (): Server | null => io;
