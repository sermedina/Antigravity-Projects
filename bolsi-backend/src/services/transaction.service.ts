import { AppDataSource } from '../config/data-source';
import { Transaction } from '../entities/Transaction';
import { Account } from '../entities/Account';
import { Category } from '../entities/Category';
import { DoaAllocation } from '../entities/DoaAllocation';
import { User } from '../entities/User';

export class TransactionService {
  async createTransaction(userId: number, data: any) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOneBy(User, { id: userId });
      if (!user) throw new Error('User not found');

      const account = await queryRunner.manager.findOneBy(Account, { id: data.account_id, user: { id: userId } });
      if (!account) throw new Error('Account not found or does not belong to user');

      let category: Category | undefined = undefined;
      if (data.category_id) {
        const foundCategory = await queryRunner.manager.findOneBy(Category, { id: data.category_id });
        if (!foundCategory) throw new Error('Category not found');
        category = foundCategory;
      }

      // Modify balance
      const amount = Number(data.amount);
      if (data.type === 'INCOME') {
        account.balance = Number(account.balance) + amount;
      } else if (data.type === 'EXPENSE') {
        account.balance = Number(account.balance) - amount;
      } else if (data.type === 'TRANSFER') {
        // Simple implementation: transfer out. Transfer IN requires a destination account.
        // For simplicity, treating TRANSFER here as out. 
        account.balance = Number(account.balance) - amount;
      }

      await queryRunner.manager.save(account);

      // Create Transaction
      const transaction = queryRunner.manager.create(Transaction, {
        user,
        account,
        category,
        amount,
        type: data.type,
        description: data.description,
        transaction_date: data.transaction_date,
      });

      const savedTx = await queryRunner.manager.save(transaction);

      // Save DOA allocations if any
      if (data.doa_allocations && data.doa_allocations.length > 0) {
        if (data.type !== 'INCOME') throw new Error('DOA can only be applied to INCOME transactions');

        let doaTotal = 0;
        for (const doa of data.doa_allocations) {
          doaTotal += Number(doa.amount);
          const allocation = queryRunner.manager.create(DoaAllocation, {
            transaction: savedTx,
            doa_type: doa.doa_type,
            amount: doa.amount
          });
          await queryRunner.manager.save(allocation);
        }

        if (doaTotal > amount) {
          throw new Error('Total DOA allocations cannot exceed transaction amount');
        }
      }

      await queryRunner.commitTransaction();
      return savedTx;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getTransactionsByUser(userId: number) {
    return await AppDataSource.getRepository(Transaction).find({
      where: { user: { id: userId } },
      relations: {
        account: true,
        category: true,
        doa_allocations: true
      },
      order: { transaction_date: 'DESC' }
    });
  }
}
