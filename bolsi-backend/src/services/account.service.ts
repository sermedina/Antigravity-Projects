import { AppDataSource } from '../config/data-source';
import { Account } from '../entities/Account';
import { User } from '../entities/User';
import { Bank } from '../entities/Bank';

export class AccountService {
  private accountRepo = AppDataSource.getRepository(Account);
  private userRepo = AppDataSource.getRepository(User);

  async getAccountsByUser(userId: number) {
    return await this.accountRepo.find({
      where: { user: { id: userId } },
      relations: { bank: true },
      order: { id: 'ASC' }
    });
  }

  async getAccountById(userId: number, accountId: number) {
    const account = await this.accountRepo.findOne({
      where: { id: accountId, user: { id: userId } },
      relations: { bank: true }
    });
    if (!account) throw new Error('Account not found');
    return account;
  }

  async createAccount(userId: number, data: any) {
    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) throw new Error('User not found');

    let bank = null;
    if (data.bankCode && (data.type === 'BANK' || data.type === 'CREDIT_CARD')) {
      const bankRepo = AppDataSource.getRepository(Bank);
      bank = await bankRepo.findOneBy({ code: data.bankCode });
    }

    const account = this.accountRepo.create({
      user,
      name: data.name,
      type: data.type,
      balance: data.balance ?? 0,
      currency: data.currency ?? 'USD',
      bank
    });

    return await this.accountRepo.save(account);
  }

  async updateAccount(userId: number, accountId: number, data: any) {
    const account = await this.getAccountById(userId, accountId);

    if (data.name !== undefined) account.name = data.name;
    if (data.type !== undefined) {
      account.type = data.type;
      if (account.type !== 'BANK' && account.type !== 'CREDIT_CARD') {
        account.bank = null;
      }
    }
    if (data.balance !== undefined) account.balance = data.balance;
    if (data.currency !== undefined) account.currency = data.currency;

    if (data.bankCode !== undefined && (account.type === 'BANK' || account.type === 'CREDIT_CARD')) {
      if (data.bankCode) {
        const bankRepo = AppDataSource.getRepository(Bank);
        const bank = await bankRepo.findOneBy({ code: data.bankCode });
        account.bank = bank;
      } else {
        account.bank = null;
      }
    }

    return await this.accountRepo.save(account);
  }

  async deleteAccount(userId: number, accountId: number) {
    const account = await this.getAccountById(userId, accountId);
    await this.accountRepo.remove(account);
    return { message: 'Account deleted successfully' };
  }
}
