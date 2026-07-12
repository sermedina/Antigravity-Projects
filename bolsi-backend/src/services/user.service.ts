import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { Account } from '../entities/Account';
import { SharedAccess } from '../entities/SharedAccess';
import { Like } from 'typeorm';
import * as bcrypt from 'bcrypt';

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

  async updateProfile(userId: number, data: any) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    if (data.first_name !== undefined) user.first_name = data.first_name;
    if (data.last_name !== undefined) user.last_name = data.last_name;
    if (data.phone !== undefined) user.phone = data.phone;
    if (data.country !== undefined) user.country = data.country;
    if (data.city !== undefined) user.city = data.city;
    if (data.user_type !== undefined) user.user_type = data.user_type;

    await this.userRepo.save(user);
    const { password_hash, ...safeUser } = user;
    return safeUser;
  }

  async changePassword(userId: number, currentPass: string, newPass: string) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    const isValid = await bcrypt.compare(currentPass, user.password_hash);
    if (!isValid) throw new Error('Incorrect current password');

    user.password_hash = await bcrypt.hash(newPass, 10);
    await this.userRepo.save(user);

    return { message: 'Password updated successfully' };
  }

  async getSharedAccesses(userId: number) {
    const sharedRepo = AppDataSource.getRepository(SharedAccess);
    const granted = await sharedRepo.find({
      where: { owner: { id: userId } },
      relations: { guest: true }
    });
    const received = await sharedRepo.find({
      where: { guest: { id: userId } },
      relations: { owner: true }
    });

    const cleanUser = (u: User) => {
      if (!u) return u;
      const { password_hash, ...rest } = u;
      return rest as User;
    };

    return {
      granted: granted.map(acc => ({ ...acc, guest: cleanUser(acc.guest) })),
      received: received.map(acc => ({ ...acc, owner: cleanUser(acc.owner) }))
    };
  }

  async createSharedAccess(userId: number, guestEmail: string, accessLevel: string = 'READ_ONLY') {
    const sharedRepo = AppDataSource.getRepository(SharedAccess);
    const owner = await this.userRepo.findOneBy({ id: userId });
    if (!owner) throw new Error('Usuario propietario no encontrado');

    const guest = await this.userRepo.findOneBy({ email: guestEmail });
    if (!guest) throw new Error('Usuario no encontrado con ese correo');

    if (owner.id === guest.id) throw new Error('No puedes compartir acceso contigo mismo');

    const existing = await sharedRepo.findOneBy({ owner: { id: owner.id }, guest: { id: guest.id } });
    if (existing) throw new Error('El acceso ya está compartido con este usuario');

    const sharedAccess = sharedRepo.create({
      owner,
      guest,
      access_level: accessLevel
    });

    const saved = await sharedRepo.save(sharedAccess);
    const { password_hash, ...safeGuest } = guest;
    return { ...saved, guest: safeGuest };
  }

  async deleteSharedAccess(userId: number, accessId: string) {
    const sharedRepo = AppDataSource.getRepository(SharedAccess);
    const access = await sharedRepo.findOne({
      where: { id: accessId },
      relations: { owner: true, guest: true }
    });

    if (!access) throw new Error('Shared access entry not found');

    if (access.owner.id !== userId && access.guest.id !== userId) {
      throw new Error('Unauthorized to remove this access');
    }

    await sharedRepo.remove(access);
    return { message: 'Shared access removed successfully' };
  }
}
