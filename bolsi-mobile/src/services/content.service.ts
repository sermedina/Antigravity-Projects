import api from './api';
import { EducationalContent, UserContentProgress } from '../types';

export const contentService = {
  async getContents(): Promise<EducationalContent[]> {
    const response = await api.get('/educational-contents');
    return response.data;
  },

  async getContent(id: number): Promise<EducationalContent> {
    const response = await api.get(`/educational-contents/${id}`);
    return response.data;
  },

  async getProgress(): Promise<UserContentProgress[]> {
    const response = await api.get('/educational-contents/progress');
    return response.data;
  },

  async updateProgress(contentId: number, progressPercentage: number): Promise<UserContentProgress> {
    const response = await api.post(`/educational-contents/${contentId}/progress`, {
      progress_percentage: progressPercentage
    });
    return response.data;
  }
};
