import api from './api';
import { Account, Bank } from '../types';

export const accountService = {
  async getAccounts(): Promise<Account[]> {
    const response = await api.get('/accounts');
    return response.data;
  },

  async getBanks(): Promise<Bank[]> {
    const response = await api.get('/banks');
    return response.data;
  },

  async getAccount(id: number): Promise<Account> {
    const response = await api.get(`/accounts/${id}`);
    return response.data;
  },

  async createAccount(data: Partial<Account>): Promise<Account> {
    const response = await api.post('/accounts', data);
    return response.data;
  },

  async updateAccount(id: number, data: Partial<Account>): Promise<Account> {
    const response = await api.put(`/accounts/${id}`, data);
    return response.data;
  },

  async deleteAccount(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/accounts/${id}`);
    return response.data;
  }
};
