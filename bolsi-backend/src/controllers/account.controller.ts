import { Request, Response } from 'express';
import { AccountService } from '../services/account.service';

const accountService = new AccountService();

export class AccountController {
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.activeUserId || (req as any).user.id;
      const result = await accountService.getAccountsByUser(userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.activeUserId || (req as any).user.id;
      const accountId = parseInt(req.params.id as string, 10);
      const result = await accountService.getAccountById(userId, accountId);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.activeUserId || (req as any).user.id;
      const result = await accountService.createAccount(userId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user.activeUserId || (req as any).user.id;
      const accountId = parseInt(req.params.id as string, 10);
      const result = await accountService.updateAccount(userId, accountId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = (req as any).user.activeUserId || (req as any).user.id;
      const accountId = parseInt(req.params.id as string, 10);
      const result = await accountService.deleteAccount(userId, accountId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
