import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

let localIp = 'localhost';

const hostUri = Constants.expoConfig?.hostUri;
if (hostUri) {
  localIp = hostUri.split(':')[0];
}

export const BASE_URL = process.env.EXPO_PUBLIC_API_URL || `http://${localIp}:3000/api`;
export const IMAGE_BASE_URL = process.env.EXPO_PUBLIC_IMAGE_BASE_URL || BASE_URL.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

let activeSharedOwnerId: string | null = null;

export const setActiveSharedOwnerId = (id: string | null) => {
  activeSharedOwnerId = id;
};

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('user_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      if (activeSharedOwnerId) {
        config.headers['x-shared-owner-id'] = activeSharedOwnerId;
      }
    } catch (e) {
      console.warn('No se pudo recuperar el token de SecureStore', e);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
