import { FastifyInstance } from 'fastify';
import jwt from 'jsonwebtoken';

interface WebSocketClient {
  userId: string;
  socket: any;
  connectedAt: Date;
}

class WebSocketService {
  private clients: Map<string, WebSocketClient[]> = new Map();
  private fastify: FastifyInstance | null = null;

  initialize(fastify: FastifyInstance) {
    this.fastify = fastify;
  }

  /**
   * Add a new WebSocket client
   */
  addClient(userId: string, socket: any) {
    const client: WebSocketClient = {
      userId,
      socket,
      connectedAt: new Date(),
    };

    const userClients = this.clients.get(userId) || [];
    userClients.push(client);
    this.clients.set(userId, userClients);

    this.fastify?.log.info(`WebSocket client connected: ${userId} (total: ${this.getTotalConnections()})`);

    // Set up cleanup on disconnect
    socket.on('close', () => {
      this.removeClient(userId, socket);
    });

    socket.on('error', (error: any) => {
      this.fastify?.log.error({ err: error }, `WebSocket error for user ${userId}`);
      this.removeClient(userId, socket);
    });
  }

  /**
   * Remove a WebSocket client
   */
  private removeClient(userId: string, socket: any) {
    const userClients = this.clients.get(userId) || [];
    const filteredClients = userClients.filter((c) => c.socket !== socket);

    if (filteredClients.length > 0) {
      this.clients.set(userId, filteredClients);
    } else {
      this.clients.delete(userId);
    }

    this.fastify?.log.info(`WebSocket client disconnected: ${userId} (total: ${this.getTotalConnections()})`);
  }

  /**
   * Send message to specific user (all their connections)
   */
  sendToUser(userId: string, event: string, data: any) {
    const userClients = this.clients.get(userId) || [];
    const message = JSON.stringify({ event, data, timestamp: new Date().toISOString() });

    userClients.forEach((client) => {
      if (client.socket.readyState === 1) { // OPEN
        try {
          client.socket.send(message);
        } catch (error) {
          this.fastify?.log.error({ err: error }, `Failed to send message to user ${userId}`);
        }
      }
    });
  }

  /**
   * Send message to multiple users
   */
  sendToUsers(userIds: string[], event: string, data: any) {
    userIds.forEach((userId) => {
      this.sendToUser(userId, event, data);
    });
  }

  /**
   * Broadcast to all connected users
   */
  broadcast(event: string, data: any) {
    const message = JSON.stringify({ event, data, timestamp: new Date().toISOString() });

    this.clients.forEach((userClients) => {
      userClients.forEach((client) => {
        if (client.socket.readyState === 1) {
          try {
            client.socket.send(message);
          } catch (error) {
            this.fastify?.log.error({ err: error }, 'Failed to broadcast message');
          }
        }
      });
    });
  }

  /**
   * Get total number of connections
   */
  getTotalConnections(): number {
    let total = 0;
    this.clients.forEach((userClients) => {
      total += userClients.length;
    });
    return total;
  }

  /**
   * Get number of unique users connected
   */
  getUniqueUsers(): number {
    return this.clients.size;
  }

  /**
   * Check if user is connected
   */
  isUserConnected(userId: string): boolean {
    return this.clients.has(userId);
  }

  /**
   * Verify JWT token and extract userId
   */
  verifyToken(token: string): string | null {
    try {
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        this.fastify?.log.error('JWT_SECRET not configured');
        return null;
      }
      const decoded = jwt.verify(token, secret) as { userId: string };
      return decoded.userId;
    } catch (error) {
      return null;
    }
  }

  // ==================== Event Emitters ====================

  /**
   * Notify about new catch in feed
   */
  notifyNewCatch(catch_: any, authorId: string) {
    // Notify all friends of the author
    this.broadcast('new_catch', {
      catchId: catch_.id,
      authorId,
      species: catch_.species,
      photoUrl: catch_.photoUrl,
    });
  }

  /**
   * Notify about new like
   */
  notifyNewLike(catchOwnerId: string, liker: any, catchId: string) {
    this.sendToUser(catchOwnerId, 'new_like', {
      catchId,
      liker: {
        id: liker.id,
        name: liker.name,
        avatar: liker.avatar,
      },
    });
  }

  /**
   * Notify about new comment
   */
  notifyNewComment(catchOwnerId: string, commenter: any, catchId: string, comment: string) {
    this.sendToUser(catchOwnerId, 'new_comment', {
      catchId,
      commenter: {
        id: commenter.id,
        name: commenter.name,
        avatar: commenter.avatar,
      },
      comment,
    });
  }

  /**
   * Notify about new message in conversation
   */
  notifyNewMessage(participantIds: string[], senderId: string, conversationId: string, message: any) {
    // Send to all participants except sender
    const recipients = participantIds.filter((id) => id !== senderId);
    this.sendToUsers(recipients, 'new_message', {
      conversationId,
      message: {
        id: message.id,
        text: message.text,
        senderId,
        createdAt: message.createdAt,
      },
    });
  }

  /**
   * Notify about new friend request
   */
  notifyFriendRequest(receiverId: string, requester: any) {
    this.sendToUser(receiverId, 'friend_request', {
      requester: {
        id: requester.id,
        name: requester.name,
        avatar: requester.avatar,
      },
    });
  }

  /**
   * Notify about friend request accepted
   */
  notifyFriendRequestAccepted(requesterId: string, accepter: any) {
    this.sendToUser(requesterId, 'friend_request_accepted', {
      friend: {
        id: accepter.id,
        name: accepter.name,
        avatar: accepter.avatar,
      },
    });
  }

  /**
   * Notify about typing indicator in conversation
   */
  notifyTyping(conversationId: string, userId: string, userName: string, participantIds: string[]) {
    const recipients = participantIds.filter((id) => id !== userId);
    this.sendToUsers(recipients, 'typing', {
      conversationId,
      userId,
      userName,
    });
  }

  /**
   * Notify about user online status
   */
  notifyUserOnline(userId: string, isOnline: boolean) {
    this.broadcast('user_status', {
      userId,
      isOnline,
      timestamp: new Date().toISOString(),
    });
  }
}

// Export singleton instance
export const wsService = new WebSocketService();
