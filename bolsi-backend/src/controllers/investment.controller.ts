import { Request, Response } from 'express';
import { InvestmentService } from '../services/investment.service';

const investmentService = new InvestmentService();

export class InvestmentController {
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await investmentService.createInvestment(userId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async addTransaction(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const invId = parseInt(req.params.invId as string, 10);
      const result = await investmentService.addTransaction(userId, invId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await investmentService.getInvestments(userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const invId = parseInt(req.params.id as string, 10);
      const result = await investmentService.getInvestmentById(userId, invId);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const invId = parseInt(req.params.id as string, 10);
      const result = await investmentService.updateInvestment(userId, invId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const invId = parseInt(req.params.id as string, 10);
      const result = await investmentService.deleteInvestment(userId, invId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
