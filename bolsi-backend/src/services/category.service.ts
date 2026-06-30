import { AppDataSource } from '../config/data-source';
import { Category } from '../entities/Category';

export class CategoryService {
  private categoryRepo = AppDataSource.getRepository(Category);

  async getCategories() {
    return await this.categoryRepo.find({
      order: { id: 'ASC' }
    });
  }

  async getCategoryById(id: number) {
    const category = await this.categoryRepo.findOneBy({ id });
    if (!category) throw new Error('Category not found');
    return category;
  }

  async createCategory(data: any) {
    const category = this.categoryRepo.create(data);
    return await this.categoryRepo.save(category);
  }

  async updateCategory(id: number, data: any) {
    const category = await this.categoryRepo.findOneBy({ id });
    if (!category) throw new Error('Category not found');

    Object.assign(category, data);
    return await this.categoryRepo.save(category);
  }

  async deleteCategory(id: number) {
    const category = await this.categoryRepo.findOneBy({ id });
    if (!category) throw new Error('Category not found');

    await this.categoryRepo.remove(category);
    return { message: 'Category deleted successfully' };
  }
}
