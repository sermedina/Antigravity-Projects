import { Request, Response } from 'express';
import { DebtService } from '../services/debt.service';

const debtService = new DebtService();

export class DebtController {
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await debtService.createDebt(userId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async pay(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const debtId = req.params.debtId as string;
      const { amount, transaction_id } = req.body;
      const result = await debtService.payDebt(userId, debtId, amount, transaction_id);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await debtService.getDebts(userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
