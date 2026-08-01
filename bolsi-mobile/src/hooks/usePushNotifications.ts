import { useEffect, useRef } from 'react';
import * as Device from 'expo-device';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import { Platform } from 'react-native';
import api from '../services/api';

const isExpoGo = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// Importar dinámicamente expo-notifications solo si no estamos en Expo Go
// para evitar que tire un error de evaluación a nivel global de módulo nativo.
const Notifications = !isExpoGo ? require('expo-notifications') : null;

if (Notifications) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
}

export function usePushNotifications(shouldRegister: boolean) {
  const notificationListener = useRef<any>(undefined);
  const responseListener = useRef<any>(undefined);

  useEffect(() => {
    if (!shouldRegister || isExpoGo || !Notifications) return;

    registerForPushNotificationsAsync().then(token => {
      if (token) {
        api.post('/users/push-token', {
          token,
          device_name: `${Device.brand || ''} ${Device.modelName || ''}`.trim() || undefined,
        }).catch(err => {
          console.warn('Error sending push token to backend:', err.response?.data || err.message);
        });
      }
    });

    notificationListener.current = Notifications.addNotificationReceivedListener((notification: any) => {
      console.log('Notification received in foreground:', notification);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response: any) => {
      const data = response.notification.request.content.data;
      console.log('User tapped notification with data:', data);
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [shouldRegister]);
}

async function registerForPushNotificationsAsync() {
  let token;
  if (!Notifications) return;

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') {
      console.warn('Failed to get push token for push notification!');
      return;
    }
    
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || Constants.easConfig?.projectId;
    if (!projectId) {
      console.warn('EAS Project ID not found in configuration');
      return;
    }

    try {
      token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      console.log('Expo Push Token retrieved:', token);
    } catch (error) {
      console.warn('Error fetching Expo Push Token:', error);
    }
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token;
}
