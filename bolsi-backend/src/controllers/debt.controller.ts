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
      const debtId = parseInt(req.params.debtId as string, 10);
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

  async getById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const debtId = parseInt(req.params.id as string, 10);
      const result = await debtService.getDebtById(userId, debtId);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const debtId = parseInt(req.params.id as string, 10);
      const result = await debtService.updateDebt(userId, debtId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const debtId = parseInt(req.params.id as string, 10);
      const result = await debtService.deleteDebt(userId, debtId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
