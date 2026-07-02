import api from './api';
import { Transaction, Category } from '../types';

export const transactionService = {
  async getTransactions(): Promise<Transaction[]> {
    const response = await api.get('/transactions');
    return response.data;
  },

  async getTransaction(id: number): Promise<Transaction> {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  async createTransaction(data: any, imageUri?: string): Promise<Transaction> {
    if (imageUri) {
      const formData = new FormData();
      
      Object.keys(data).forEach(key => {
        if (key === 'doa_allocations') {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, String(data[key]));
        }
      });

      const filename = imageUri.split('/').pop() || 'receipt.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('payment_receipt_image', {
        uri: imageUri,
        name: filename,
        type
      } as any);

      const response = await api.post('/transactions', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      const response = await api.post('/transactions', data);
      return response.data;
    }
  },

  async updateTransaction(id: number, data: any, imageUri?: string): Promise<Transaction> {
    if (imageUri) {
      const formData = new FormData();
      
      Object.keys(data).forEach(key => {
        if (key === 'doa_allocations') {
          formData.append(key, JSON.stringify(data[key]));
        } else {
          formData.append(key, String(data[key]));
        }
      });

      const filename = imageUri.split('/').pop() || 'receipt.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append('payment_receipt_image', {
        uri: imageUri,
        name: filename,
        type
      } as any);

      const response = await api.put(`/transactions/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } else {
      const response = await api.put(`/transactions/${id}`, data);
      return response.data;
    }
  },

  async deleteTransaction(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  },

  async getCategories(): Promise<Category[]> {
    const response = await api.get('/categories');
    return response.data;
  }
};
