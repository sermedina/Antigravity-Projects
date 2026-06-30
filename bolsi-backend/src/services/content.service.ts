import { AppDataSource } from '../config/data-source';
import { EducationalContent } from '../entities/EducationalContent';
import { UserContentProgress } from '../entities/UserContentProgress';
import { User } from '../entities/User';

export class ContentService {
  private contentRepo = AppDataSource.getRepository(EducationalContent);
  private progressRepo = AppDataSource.getRepository(UserContentProgress);
  private userRepo = AppDataSource.getRepository(User);

  async getContents(status?: string) {
    const where: any = {};
    if (status) {
      where.status = status;
    }
    return await this.contentRepo.find({
      where,
      order: { created_at: 'DESC' }
    });
  }

  async getContentById(id: number) {
    const content = await this.contentRepo.findOneBy({ id });
    if (!content) throw new Error('Content not found');
    return content;
  }

  async createContent(data: any) {
    const content = this.contentRepo.create(data);
    return await this.contentRepo.save(content);
  }

  async updateContent(id: number, data: any) {
    const content = await this.contentRepo.findOneBy({ id });
    if (!content) throw new Error('Content not found');

    Object.assign(content, data);
    return await this.contentRepo.save(content);
  }

  async deleteContent(id: number) {
    const content = await this.contentRepo.findOneBy({ id });
    if (!content) throw new Error('Content not found');

    await this.contentRepo.remove(content);
    return { message: 'Content deleted successfully' };
  }

  async updateProgress(userId: number, contentId: number, progressPercentage: number) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    const content = await this.contentRepo.findOneBy({ id: contentId });
    if (!content) throw new Error('Content not found');

    let progress = await this.progressRepo.findOne({
      where: { user: { id: userId }, content: { id: contentId } }
    });

    if (!progress) {
      progress = this.progressRepo.create({
        user,
        content,
        progress_percentage: progressPercentage
      });
    } else {
      progress.progress_percentage = progressPercentage;
    }

    if (progressPercentage >= 100) {
      progress.progress_percentage = 100;
      progress.completed_at = new Date();
    } else {
      progress.completed_at = null;
    }

    return await this.progressRepo.save(progress);
  }

  async getProgressByUser(userId: number) {
    return await this.progressRepo.find({
      where: { user: { id: userId } },
      relations: { content: true }
    });
  }

  async getGlobalProgress() {
    const progressList = await this.progressRepo.find({
      relations: { user: true, content: true },
      order: { completed_at: 'DESC' }
    });

    // Remove password hashes from users in relations
    return progressList.map(progress => {
      if (progress.user) {
        const { password_hash, ...safeUser } = progress.user;
        progress.user = safeUser as User;
      }
      return progress;
    });
  }
}
