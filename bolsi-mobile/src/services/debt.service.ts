import api from './api';
import { Debt, DebtPayment } from '../types';

export const debtService = {
  async getDebts(): Promise<Debt[]> {
    const response = await api.get('/debts');
    return response.data;
  },

  async getDebt(id: number): Promise<Debt> {
    const response = await api.get(`/debts/${id}`);
    return response.data;
  },

  async createDebt(data: Partial<Debt>): Promise<Debt> {
    const response = await api.post('/debts', data);
    return response.data;
  },

  async payDebt(debtId: number, amount: number, transactionId?: number): Promise<{ payment: DebtPayment, remaining_amount: number }> {
    const response = await api.post(`/debts/${debtId}/pay`, { amount, transaction_id: transactionId });
    return response.data;
  },

  async updateDebt(id: number, data: Partial<Debt>): Promise<Debt> {
    const response = await api.put(`/debts/${id}`, data);
    return response.data;
  },

  async deleteDebt(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/debts/${id}`);
    return response.data;
  }
};
