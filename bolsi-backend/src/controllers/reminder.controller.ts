import { Response } from 'express';
import { ReminderService } from '../services/reminder.service';
import { AuthRequest } from '../middlewares/auth.middleware';

const reminderService = new ReminderService();

export class ReminderController {
  async getMyReminders(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const result = await reminderService.getReminders(userId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async createReminder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const result = await reminderService.createReminder(userId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateReminder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id as string, 10);
      const result = await reminderService.updateReminder(userId, id, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteReminder(req: AuthRequest, res: Response) {
    try {
      const userId = req.user.id;
      const id = parseInt(req.params.id as string, 10);
      const result = await reminderService.deleteReminder(userId, id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllReminders(req: AuthRequest, res: Response) {
    try {
      const result = await reminderService.getAllReminders();
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
