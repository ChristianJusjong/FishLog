import { FastifyInstance } from 'fastify';
import { SocketStream } from '@fastify/websocket';
import { wsService } from '../services/websocket.js';

export async function websocketRoutes(fastify: FastifyInstance) {
  fastify.get('/ws', { websocket: true }, (socket: SocketStream, request) => {
    // Extract token from query params
    const token = request.query.token as string;

    if (!token) {
      socket.socket.send(JSON.stringify({ error: 'Authentication required' }));
      socket.socket.close();
      return;
    }

    // Verify token and get userId
    const userId = wsService.verifyToken(token);

    if (!userId) {
      socket.socket.send(JSON.stringify({ error: 'Invalid token' }));
      socket.socket.close();
      return;
    }

    // Add client to WebSocket service
    wsService.addClient(userId, socket.socket);

    // Send welcome message
    socket.socket.send(JSON.stringify({
      event: 'connected',
      data: { userId, message: 'WebSocket connection established' },
      timestamp: new Date().toISOString(),
    }));

    // Notify others that user is online
    wsService.notifyUserOnline(userId, true);

    // Handle incoming messages from client
    socket.socket.on('message', (message: Buffer) => {
      try {
        const data = JSON.parse(message.toString());
        handleClientMessage(userId, data);
      } catch (error) {
        fastify.log.error('Failed to parse WebSocket message:', error);
      }
    });

    // Handle disconnect
    socket.socket.on('close', () => {
      wsService.notifyUserOnline(userId, false);
    });
  });

  // Helper function to handle client messages
  function handleClientMessage(userId: string, data: any) {
    switch (data.type) {
      case 'ping':
        // Respond to ping with pong
        wsService.sendToUser(userId, 'pong', { timestamp: new Date().toISOString() });
        break;

      case 'typing':
        // Forward typing indicator to conversation participants
        if (data.conversationId && data.participantIds) {
          wsService.notifyTyping(
            data.conversationId,
            userId,
            data.userName || 'User',
            data.participantIds
          );
        }
        break;

      default:
        fastify.log.warn(`Unknown message type: ${data.type}`);
    }
  }
}
