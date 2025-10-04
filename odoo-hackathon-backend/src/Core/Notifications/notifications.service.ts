import { Injectable, Logger } from '@nestjs/common';
import fb from '../../firebase/firebase';
import { NotificationDto } from './notification.dto';


@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private db = fb.getFirestore();

  async createNotification(dto: NotificationDto) {
    try {
      const notifRef = this.db.collection('notifications').doc();
      const data = {
        ...dto,
        read: false,
        createdAt: new Date(),
      };
      await notifRef.set(data);
      return { success: true, id: notifRef.id, ...data };
    } catch (error) {
      this.logger.error(`Error creating notification: ${error.message}`);
      throw error;
    }
  }

  async markAsRead(id: string) {
    try {
      await this.db.collection('notifications').doc(id).update({ read: true });
      return { success: true, id, message: 'Notification marked as read' };
    } catch (error) {
      this.logger.error(`Error updating notification: ${error.message}`);
      throw error;
    }
  }

  async getUserNotifications(userId: string, companyId: string) {
    const snapshot = await this.db
      .collection('notifications')
      .where('userId', '==', userId)
      .where('companyId', '==', companyId)
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }
}
