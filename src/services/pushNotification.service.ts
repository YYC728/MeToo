import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import User from '../models/user.model';

interface PushNotificationData {
  title: string;
  body: string;
  data?: any;
  imageUrl?: string;
}

interface PushNotificationPayload {
  token: string;
  notification: {
    title: string;
    body: string;
    imageUrl?: string;
  };
  data?: any;
  android?: {
    notification: {
      icon: string;
      color: string;
      sound: string;
    };
  };
  apns?: {
    payload: {
      aps: {
        sound: string;
        badge: number;
      };
    };
  };
}

class PushNotificationService {
  private initialized = false;

  constructor() {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    if (this.initialized) return;

    try {
      // Initialize Firebase Admin SDK
      const serviceAccount: ServiceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      };

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      this.initialized = true;
      console.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  /**
   * Send push notification to a single user
   */
  async sendToUser(userId: string, notification: PushNotificationData): Promise<boolean> {
    try {
      if (!this.initialized) {
        console.error('Firebase not initialized');
        return false;
      }

      const user = await User.findById(userId).select('fcm_tokens');
      if (!user || !user.fcm_tokens || user.fcm_tokens.length === 0) {
        console.log(`No FCM tokens found for user ${userId}`);
        return false;
      }

      const promises = user.fcm_tokens.map((token: string) => 
        this.sendToToken(token, notification)
      );

      const results = await Promise.allSettled(promises);
      const successCount = results.filter(result => result.status === 'fulfilled').length;
      
      console.log(`Sent notification to ${successCount}/${user.fcm_tokens.length} devices for user ${userId}`);
      return successCount > 0;
    } catch (error) {
      console.error('Error sending push notification to user:', error);
      return false;
    }
  }

  /**
   * Send push notification to multiple users
   */
  async sendToUsers(userIds: string[], notification: PushNotificationData): Promise<number> {
    try {
      const promises = userIds.map(userId => this.sendToUser(userId, notification));
      const results = await Promise.allSettled(promises);
      return results.filter(result => result.status === 'fulfilled' && result.value).length;
    } catch (error) {
      console.error('Error sending push notifications to users:', error);
      return 0;
    }
  }

  /**
   * Send push notification to all users
   */
  async sendToAllUsers(notification: PushNotificationData): Promise<number> {
    try {
      const users = await User.find({ fcm_tokens: { $exists: true, $ne: [] } }).select('_id');
      const userIds = users.map(user => user._id.toString());
      return await this.sendToUsers(userIds, notification);
    } catch (error) {
      console.error('Error sending push notification to all users:', error);
      return 0;
    }
  }

  /**
   * Send push notification to a specific FCM token
   */
  private async sendToToken(token: string, notification: PushNotificationData): Promise<boolean> {
    try {
      const payload: PushNotificationPayload = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: notification.data,
        android: {
          notification: {
            icon: 'ic_notification',
            color: '#1976d2',
            sound: 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
              badge: 1,
            },
          },
        },
      };

      const response = await admin.messaging().send(payload);
      console.log('Successfully sent message:', response);
      return true;
    } catch (error) {
      console.error('Error sending push notification to token:', error);
      
      // If token is invalid, remove it from user's tokens
      if (error.code === 'messaging/invalid-registration-token' || 
          error.code === 'messaging/registration-token-not-registered') {
        await this.removeInvalidToken(token);
      }
      
      return false;
    }
  }

  /**
   * Remove invalid FCM token from all users
   */
  private async removeInvalidToken(token: string): Promise<void> {
    try {
      await User.updateMany(
        { fcm_tokens: token },
        { $pull: { fcm_tokens: token } }
      );
      console.log(`Removed invalid token: ${token}`);
    } catch (error) {
      console.error('Error removing invalid token:', error);
    }
  }

  /**
   * Send notification for new meal near user
   */
  async notifyNewMealNearby(userId: string, mealData: any): Promise<boolean> {
    const notification: PushNotificationData = {
      title: '🍽️ New Meal Near You!',
      body: `${mealData.dish_name} is available nearby. Check it out!`,
      data: {
        type: 'new_meal',
        mealId: mealData._id,
        screen: 'Meals',
      },
    };

    return await this.sendToUser(userId, notification);
  }

  /**
   * Send notification for new story comment
   */
  async notifyNewComment(userId: string, storyData: any, commentData: any): Promise<boolean> {
    const notification: PushNotificationData = {
      title: '💬 New Comment on Your Story',
      body: `Someone commented on your story: "${commentData.text_content.substring(0, 50)}..."`,
      data: {
        type: 'new_comment',
        storyId: storyData._id,
        commentId: commentData._id,
        screen: 'Stories',
      },
    };

    return await this.sendToUser(userId, notification);
  }

  /**
   * Send notification for new message
   */
  async notifyNewMessage(userId: string, messageData: any, senderName: string): Promise<boolean> {
    const notification: PushNotificationData = {
      title: `💬 New Message from ${senderName}`,
      body: messageData.content,
      data: {
        type: 'new_message',
        messageId: messageData._id,
        senderId: messageData.sender_id,
        screen: 'Chat',
      },
    };

    return await this.sendToUser(userId, notification);
  }

  /**
   * Send notification for story support
   */
  async notifyStorySupport(userId: string, storyData: any): Promise<boolean> {
    const notification: PushNotificationData = {
      title: '🤗 Your Story Got Support',
      body: 'Someone showed support for your story. You\'re not alone!',
      data: {
        type: 'story_support',
        storyId: storyData._id,
        screen: 'Stories',
      },
    };

    return await this.sendToUser(userId, notification);
  }
}

export default new PushNotificationService();
