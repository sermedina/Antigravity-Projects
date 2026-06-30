import { Request, Response } from 'express';
import { ContentService } from '../services/content.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const contentService = new ContentService();

export class ContentController {
  async getContents(req: Request, res: Response) {
    try {
      const status = req.query.status as string;
      const result = await contentService.getContents(status);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getContentById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const result = await contentService.getContentById(id);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createContent(req: Request, res: Response) {
    try {
      const result = await contentService.createContent(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateContent(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const result = await contentService.updateContent(id, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteContent(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const result = await contentService.deleteContent(id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateProgress(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const contentId = parseInt(req.params.id as string, 10);
      const { progress_percentage } = req.body;
      if (progress_percentage === undefined) {
        return res.status(400).json({ error: 'progress_percentage is required' });
      }
      const result = await contentService.updateProgress(userId, contentId, progress_percentage);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getProgressByUser(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const result = await contentService.getProgressByUser(userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getGlobalProgress(req: Request, res: Response) {
    try {
      const result = await contentService.getGlobalProgress();
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
