import api from './api';

export const authService = {
  async login(username: string, pass: string) {
    const response = await api.post('/auth/login', { username, password: pass });
    return response.data;
  },

  async register(data: any) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async verifyEmail(email: string, token: string) {
    const response = await api.post('/auth/verify-email', { email, token });
    return response.data;
  },

  async requestPasswordRecovery(email: string) {
    const response = await api.post('/auth/request-password-recovery', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string) {
    const response = await api.post('/auth/reset-password', { token, new_password: newPassword });
    return response.data;
  }
};
