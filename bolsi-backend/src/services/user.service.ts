import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { Account } from '../entities/Account';
import { Like } from 'typeorm';

export class UserService {
  private userRepo = AppDataSource.getRepository(User);

  async getUsers(filters: any, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters.username) {
      where.username = Like(`%${filters.username}%`);
    }

    if (filters.email) {
      where.email = Like(`%${filters.email}%`);
    }

    if (filters.user_type) {
      where.user_type = filters.user_type;
    }

    if (filters.is_active !== undefined) {
      where.is_active = filters.is_active;
    }

    if (filters.is_email_verified !== undefined) {
      where.is_email_verified = filters.is_email_verified;
    }

    const [users, total] = await this.userRepo.findAndCount({
      where,
      skip,
      take: limit,
      order: { created_at: 'DESC' },
      relations: { roles: true }
    });

    // Remove password hash for safety
    const safeUsers = users.map(user => {
      const { password_hash, ...rest } = user;
      return rest;
    });

    return {
      data: safeUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    };
  }

  async getUserById(id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: { roles: true, verification_tokens: true }
    });

    if (!user) throw new Error('User not found');

    const accounts = await AppDataSource.getRepository(Account).find({
      where: { user: { id } }
    });

    const { password_hash, ...safeUser } = user;
    return { ...safeUser, accounts };
  }

  async toggleUserStatus(id: number, is_active: boolean) {
    const user = await this.userRepo.findOneBy({ id });
    if (!user) throw new Error('User not found');

    user.is_active = is_active;
    await this.userRepo.save(user);

    const { password_hash, ...safeUser } = user;
    return safeUser;
  }
}
