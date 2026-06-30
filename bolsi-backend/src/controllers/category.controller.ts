import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';

const categoryService = new CategoryService();

export class CategoryController {
  async getCategories(req: Request, res: Response) {
    try {
      const result = await categoryService.getCategories();
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async getCategoryById(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const result = await categoryService.getCategoryById(id);
      res.json(result);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  }

  async createCategory(req: Request, res: Response) {
    try {
      const result = await categoryService.createCategory(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateCategory(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const result = await categoryService.updateCategory(id, req.body);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteCategory(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id as string, 10);
      const result = await categoryService.deleteCategory(id);
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
}
