import { Request, Response } from 'express';
import { TransactionService } from '../services/transaction.service';

const transactionService = new TransactionService();

export class TransactionController {
  async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await transactionService.createTransaction(userId, req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAll(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const result = await transactionService.getTransactionsByUser(userId);
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAdminTransactions(req: Request, res: Response) {
    try {
      const result = await transactionService.getAllTransactions();
      res.json(result);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const txId = parseInt(req.params.id as string, 10);
      const result = await transactionService.getTransactionById(userId, txId);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const txId = parseInt(req.params.id as string, 10);
      
      // If a file was uploaded by multer, set the payment_receipt_image path
      if (req.file) {
        req.body.payment_receipt_image = `/uploads/${req.file.filename}`;
      }

      const result = await transactionService.updateTransaction(userId, txId, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async delete(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const txId = parseInt(req.params.id as string, 10);
      const result = await transactionService.deleteTransaction(userId, txId);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
