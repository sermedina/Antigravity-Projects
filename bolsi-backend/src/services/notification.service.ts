import { Expo, ExpoPushMessage } from 'expo-server-sdk';
import { AppDataSource } from '../config/data-source';
import { PushToken } from '../entities/PushToken';

export class NotificationService {
  private expo = new Expo();
  private pushTokenRepo = AppDataSource.getRepository(PushToken);

  async registerToken(userId: number, token: string, deviceName?: string) {
    if (!Expo.isExpoPushToken(token)) {
      throw new Error('Invalid Expo Push Token');
    }

    let pushToken = await this.pushTokenRepo.findOneBy({ token });
    if (pushToken) {
      pushToken.user = { id: userId } as any;
      if (deviceName) pushToken.device_name = deviceName;
    } else {
      pushToken = this.pushTokenRepo.create({
        user: { id: userId },
        token,
        device_name: deviceName,
      });
    }

    await this.pushTokenRepo.save(pushToken);
    return { message: 'Push token registered successfully' };
  }

  async sendToUser(userId: number, title: string, body: string, data?: Record<string, any>) {
    const tokens = await this.pushTokenRepo.findBy({ user: { id: userId } });
    if (tokens.length === 0) return;

    const messages: ExpoPushMessage[] = tokens.map(t => ({
      to: t.token,
      sound: 'default',
      title,
      body,
      data,
    }));

    const chunks = this.expo.chunkPushNotifications(messages);
    for (const chunk of chunks) {
      try {
        await this.expo.sendPushNotificationsAsync(chunk);
      } catch (error) {
        console.error('Error sending push notifications:', error);
      }
    }
  }
}
