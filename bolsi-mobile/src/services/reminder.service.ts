import api from './api';
import { Reminder } from '../types';

export const reminderService = {
  async getReminders(): Promise<Reminder[]> {
    const response = await api.get('/reminders');
    return response.data;
  },

  async createReminder(data: Partial<Reminder>): Promise<Reminder> {
    const response = await api.post('/reminders', data);
    return response.data;
  },

  async updateReminder(id: number, data: Partial<Reminder>): Promise<Reminder> {
    const response = await api.put(`/reminders/${id}`, data);
    return response.data;
  },

  async deleteReminder(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/reminders/${id}`);
    return response.data;
  }
};
