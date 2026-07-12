import { Request, Response } from 'express';
import { GoalService } from '../services/goal.service';

const goalService = new GoalService();

export class GoalController {
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.activeUserId || (req as any).user.id;
      const result = await goalService.createGoal(userId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async contribute(req: Request, res: Response) {
    try {
      const userId = (req as any).user.activeUserId || (req as any).user.id;
      const goalId = Number(req.params.goalId);
      const { amount, transaction_id } = req.body;
      const result = await goalService.contribute(userId, goalId, amount, transaction_id);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.activeUserId || (req as any).user.id;
      const result = await goalService.getGoals(userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const userId = (req as any).user.activeUserId || (req as any).user.id;
      const goalId = Number(req.params.goalId);
      const result = await goalService.deleteGoal(userId, goalId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.activeUserId || (req as any).user.id;
      const goalId = parseInt(req.params.id as string, 10);
      const result = await goalService.getGoalById(userId, goalId);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user.activeUserId || (req as any).user.id;
      const goalId = parseInt(req.params.id as string, 10);
      const result = await goalService.updateGoal(userId, goalId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
