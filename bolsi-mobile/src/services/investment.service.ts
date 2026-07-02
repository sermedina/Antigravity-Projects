import api from './api';
import { Investment, InvestmentTransaction } from '../types';

export const investmentService = {
  async getInvestments(): Promise<Investment[]> {
    const response = await api.get('/investments');
    return response.data;
  },

  async getInvestment(id: number): Promise<Investment> {
    const response = await api.get(`/investments/${id}`);
    return response.data;
  },

  async createInvestment(data: Partial<Investment>): Promise<Investment> {
    const response = await api.post('/investments', data);
    return response.data;
  },

  async addInvestmentTransaction(invId: number, data: { type: string, amount: number, transaction_id?: number }): Promise<InvestmentTransaction> {
    const response = await api.post(`/investments/${invId}/transactions`, data);
    return response.data;
  },

  async updateInvestment(id: number, data: Partial<Investment>): Promise<Investment> {
    const response = await api.put(`/investments/${id}`, data);
    return response.data;
  },

  async deleteInvestment(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/investments/${id}`);
    return response.data;
  }
};
