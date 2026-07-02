import { AppDataSource } from '../config/data-source';
import { Account } from '../entities/Account';
import { User } from '../entities/User';

export class AccountService {
  private accountRepo = AppDataSource.getRepository(Account);
  private userRepo = AppDataSource.getRepository(User);

  async getAccountsByUser(userId: number) {
    return await this.accountRepo.find({
      where: { user: { id: userId } },
      order: { id: 'ASC' }
    });
  }

  async getAccountById(userId: number, accountId: number) {
    const account = await this.accountRepo.findOne({
      where: { id: accountId, user: { id: userId } }
    });
    if (!account) throw new Error('Account not found');
    return account;
  }

  async createAccount(userId: number, data: any) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    const account = this.accountRepo.create({
      user,
      name: data.name,
      type: data.type,
      balance: data.balance ?? 0,
      currency: data.currency ?? 'USD'
    });

    return await this.accountRepo.save(account);
  }

  async updateAccount(userId: number, accountId: number, data: any) {
    const account = await this.getAccountById(userId, accountId);

    if (data.name !== undefined) account.name = data.name;
    if (data.type !== undefined) account.type = data.type;
    if (data.balance !== undefined) account.balance = data.balance;
    if (data.currency !== undefined) account.currency = data.currency;

    return await this.accountRepo.save(account);
  }

  async deleteAccount(userId: number, accountId: number) {
    const account = await this.getAccountById(userId, accountId);
    await this.accountRepo.remove(account);
    return { message: 'Account deleted successfully' };
  }
}
