import { PrismaClient } from '@prisma/client';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';

const prisma = new PrismaClient();
const expo = new Expo();

interface PushNotificationData {
  title: string;
  body: string;
  data?: any;
  badge?: number;
  sound?: 'default' | null;
  priority?: 'default' | 'normal' | 'high';
}

class PushNotificationService {
  /**
   * Register a push token for a user
   */
  async registerToken(userId: string, token: string, device?: string) {
    try {
      // Validate token
      if (!Expo.isExpoPushToken(token)) {
        throw new Error('Invalid Expo push token');
      }

      // Check if token already exists
      const existing = await prisma.pushToken.findUnique({
        where: { token },
      });

      if (existing) {
        // Update existing token
        return await prisma.pushToken.update({
          where: { token },
          data: {
            userId,
            device,
            updatedAt: new Date(),
          },
        });
      }

      // Create new token
      return await prisma.pushToken.create({
        data: {
          userId,
          token,
          device,
        },
      });
    } catch (error) {
      console.error('Error registering push token:', error);
      throw error;
    }
  }

  /**
   * Unregister a push token
   */
  async unregisterToken(token: string) {
    try {
      await prisma.pushToken.delete({
        where: { token },
      });
    } catch (error) {
      console.error('Error unregistering push token:', error);
    }
  }

  /**
   * Get all push tokens for a user
   */
  async getUserTokens(userId: string): Promise<string[]> {
    try {
      const tokens = await prisma.pushToken.findMany({
        where: { userId },
        select: { token: true },
      });

      return tokens.map((t) => t.token).filter((token) => Expo.isExpoPushToken(token));
    } catch (error) {
      console.error('Error fetching user tokens:', error);
      return [];
    }
  }

  /**
   * Send push notification to a single user
   */
  async sendToUser(userId: string, notification: PushNotificationData) {
    try {
      const tokens = await this.getUserTokens(userId);
      if (tokens.length === 0) {
        console.log(`No push tokens found for user ${userId}`);
        return;
      }

      await this.sendToTokens(tokens, notification);
    } catch (error) {
      console.error(`Error sending push notification to user ${userId}:`, error);
    }
  }

  /**
   * Send push notifications to multiple users
   */
  async sendToUsers(userIds: string[], notification: PushNotificationData) {
    try {
      const allTokens: string[] = [];

      for (const userId of userIds) {
        const tokens = await this.getUserTokens(userId);
        allTokens.push(...tokens);
      }

      if (allTokens.length === 0) {
        console.log('No push tokens found for any users');
        return;
      }

      await this.sendToTokens(allTokens, notification);
    } catch (error) {
      console.error('Error sending push notifications to users:', error);
    }
  }

  /**
   * Send push notifications to specific tokens
   */
  async sendToTokens(tokens: string[], notification: PushNotificationData) {
    try {
      // Filter valid tokens
      const validTokens = tokens.filter((token) => Expo.isExpoPushToken(token));

      if (validTokens.length === 0) {
        console.log('No valid push tokens to send to');
        return;
      }

      // Create messages
      const messages: ExpoPushMessage[] = validTokens.map((token) => ({
        to: token,
        title: notification.title,
        body: notification.body,
        data: notification.data,
        badge: notification.badge,
        sound: notification.sound || 'default',
        priority: notification.priority || 'high',
      }));

      // Chunk messages (Expo recommends chunks of 100)
      const chunks = expo.chunkPushNotifications(messages);
      const tickets: ExpoPushTicket[] = [];

      // Send chunks
      for (const chunk of chunks) {
        try {
          const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
          tickets.push(...ticketChunk);
        } catch (error) {
          console.error('Error sending push notification chunk:', error);
        }
      }

      // Check for errors in tickets
      for (let i = 0; i < tickets.length; i++) {
        const ticket = tickets[i];
        if (ticket.status === 'error') {
          console.error(`Push notification error for token ${validTokens[i]}:`, ticket.message);

          // If token is invalid, remove it
          if (ticket.details?.error === 'DeviceNotRegistered') {
            await this.unregisterToken(validTokens[i]);
          }
        }
      }

      console.log(`Sent ${tickets.length} push notifications`);
    } catch (error) {
      console.error('Error sending push notifications:', error);
    }
  }

  // ==================== Notification Helpers ====================

  /**
   * Send new like notification
   */
  async notifyNewLike(catchOwnerId: string, likerName: string, catchId: string) {
    await this.sendToUser(catchOwnerId, {
      title: 'Ny Like',
      body: `${likerName} kan lide din fangst`,
      data: { type: 'new_like', catchId },
    });
  }

  /**
   * Send new comment notification
   */
  async notifyNewComment(catchOwnerId: string, commenterName: string, catchId: string, comment: string) {
    await this.sendToUser(catchOwnerId, {
      title: 'Ny Kommentar',
      body: `${commenterName}: ${comment.substring(0, 50)}${comment.length > 50 ? '...' : ''}`,
      data: { type: 'new_comment', catchId },
    });
  }

  /**
   * Send new message notification
   */
  async notifyNewMessage(receiverId: string, senderName: string, conversationId: string, message: string) {
    await this.sendToUser(receiverId, {
      title: `Besked fra ${senderName}`,
      body: message.substring(0, 100),
      data: { type: 'new_message', conversationId },
    });
  }

  /**
   * Send friend request notification
   */
  async notifyFriendRequest(receiverId: string, requesterName: string) {
    await this.sendToUser(receiverId, {
      title: 'Ny Venneanmodning',
      body: `${requesterName} har sendt dig en venneanmodning`,
      data: { type: 'friend_request' },
    });
  }

  /**
   * Send friend request accepted notification
   */
  async notifyFriendRequestAccepted(requesterId: string, accepterName: string) {
    await this.sendToUser(requesterId, {
      title: 'Venneanmodning Accepteret',
      body: `${accepterName} har accepteret din venneanmodning`,
      data: { type: 'friend_request_accepted' },
    });
  }
}

export const pushNotificationService = new PushNotificationService();
