import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Bank } from '../entities/Bank';

export class BankController {
  async getAll(req: Request, res: Response) {
    try {
      const bankRepo = AppDataSource.getRepository(Bank);
      const banks = await bankRepo.find({
        order: { name: 'ASC' }
      });
      res.json(banks);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
}
