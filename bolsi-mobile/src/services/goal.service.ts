import api from './api';
import { Goal, GoalContribution } from '../types';

export const goalService = {
  async getGoals(): Promise<Goal[]> {
    const response = await api.get('/goals');
    return response.data;
  },

  async getGoal(id: number): Promise<Goal> {
    const response = await api.get(`/goals/${id}`);
    return response.data;
  },

  async createGoal(data: Partial<Goal>): Promise<Goal> {
    const response = await api.post('/goals', data);
    return response.data;
  },

  async contributeToGoal(goalId: number, amount: number, transactionId?: number): Promise<GoalContribution> {
    const response = await api.post(`/goals/${goalId}/contribute`, { amount, transaction_id: transactionId });
    return response.data;
  },

  async updateGoal(id: number, data: Partial<Goal>): Promise<Goal> {
    const response = await api.put(`/goals/${id}`, data);
    return response.data;
  },

  async deleteGoal(id: number): Promise<{ message: string }> {
    const response = await api.delete(`/goals/${id}`);
    return response.data;
  }
};
