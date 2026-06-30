import { Request, Response } from 'express';
import { UserService } from '../services/user.service';

const userService = new UserService();

export class UserController {
  async getUsers(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string || '1', 10);
      const limit = parseInt(req.query.limit as string || '10', 10);
      const filters = {
        username: req.query.username as string,
        email: req.query.email as string,
        user_type: req.query.user_type as string,
        is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
        is_email_verified: req.query.is_email_verified !== undefined ? req.query.is_email_verified === 'true' : undefined,
      };

      const result = await userService.getUsers(filters, page, limit);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const result = await userService.getUserById(id);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async toggleStatus(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const { is_active } = req.body;
      if (is_active === undefined) {
        return res.status(400).json({ error: 'is_active field is required' });
      }
      const result = await userService.toggleUserStatus(id, is_active);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
