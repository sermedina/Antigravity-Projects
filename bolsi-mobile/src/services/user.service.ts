import api from './api';
import { User, SharedAccess } from '../types';

export const userService = {
  async getProfile(): Promise<User> {
    const response = await api.get('/users/profile');
    return response.data;
  },

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  async changePassword(currentPass: string, newPass: string): Promise<{ message: string }> {
    const response = await api.put('/users/change-password', {
      current_password: currentPass,
      new_password: newPass
    });
    return response.data;
  },

  async getSharedAccesses(): Promise<{ granted: SharedAccess[], received: SharedAccess[] }> {
    const response = await api.get('/users/shared-access');
    return response.data;
  },

  async createSharedAccess(guestEmail: string, accessLevel: 'READ_ONLY' | 'READ_WRITE' = 'READ_ONLY'): Promise<SharedAccess> {
    const response = await api.post('/users/shared-access', {
      guest_email: guestEmail,
      access_level: accessLevel
    });
    return response.data;
  },

  async deleteSharedAccess(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/users/shared-access/${id}`);
    return response.data;
  }
};
