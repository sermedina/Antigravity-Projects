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
        payment_receipt_image: data.payment_receipt_image,
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

  async getAllTransactions() {
    return await AppDataSource.getRepository(Transaction).find({
      relations: {
        account: true,
        category: true,
        doa_allocations: true,
        user: true
      },
      order: { transaction_date: 'DESC' }
    });
  }

  async getTransactionById(userId: number, txId: number) {
    const tx = await AppDataSource.getRepository(Transaction).findOne({
      where: { id: txId, user: { id: userId } },
      relations: {
        account: true,
        category: true,
        doa_allocations: true
      }
    });
    if (!tx) throw new Error('Transaction not found');
    return tx;
  }

  async updateTransaction(userId: number, txId: number, data: any) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tx = await queryRunner.manager.findOne(Transaction, {
        where: { id: txId, user: { id: userId } },
        relations: { account: true, category: true, doa_allocations: true }
      });
      if (!tx) throw new Error('Transaction not found');

      const oldAmount = Number(tx.amount);
      const oldType = tx.type;
      const oldAccount = tx.account;

      // Determine new account
      let newAccount = oldAccount;
      if (data.account_id && data.account_id !== oldAccount.id) {
        const acc = await queryRunner.manager.findOneBy(Account, { id: data.account_id, user: { id: userId } });
        if (!acc) throw new Error('New account not found');
        newAccount = acc;
      }

      // Determine new category
      let newCategory = tx.category;
      if (data.category_id !== undefined) {
        if (data.category_id === null) {
          newCategory = null as any;
        } else {
          const cat = await queryRunner.manager.findOneBy(Category, { id: data.category_id });
          if (!cat) throw new Error('Category not found');
          newCategory = cat;
        }
      }

      const newAmount = data.amount !== undefined ? Number(data.amount) : oldAmount;
      const newType = data.type !== undefined ? data.type : oldType;

      // 1. Revert old transaction on old account
      if (oldType === 'INCOME') {
        oldAccount.balance = Number(oldAccount.balance) - oldAmount;
      } else if (oldType === 'EXPENSE' || oldType === 'TRANSFER') {
        oldAccount.balance = Number(oldAccount.balance) + oldAmount;
      }
      await queryRunner.manager.save(oldAccount);

      // Reload newAccount balance in case it was the same as oldAccount, so we work on updated balance
      if (newAccount.id === oldAccount.id) {
        newAccount.balance = oldAccount.balance;
      }

      // 2. Apply new transaction on new account
      if (newType === 'INCOME') {
        newAccount.balance = Number(newAccount.balance) + newAmount;
      } else if (newType === 'EXPENSE' || newType === 'TRANSFER') {
        newAccount.balance = Number(newAccount.balance) - newAmount;
      }
      await queryRunner.manager.save(newAccount);

      // Update tx fields
      tx.account = newAccount;
      tx.category = newCategory;
      tx.amount = newAmount;
      tx.type = newType;
      if (data.description !== undefined) tx.description = data.description;
      if (data.payment_receipt_image !== undefined) tx.payment_receipt_image = data.payment_receipt_image;
      if (data.transaction_date !== undefined) tx.transaction_date = data.transaction_date;

      const savedTx = await queryRunner.manager.save(tx);

      // Update DOA allocations
      if (data.doa_allocations !== undefined || newType !== 'INCOME') {
        // Clear old allocations
        await queryRunner.manager.delete(DoaAllocation, { transaction: { id: txId } });

        if (newType === 'INCOME' && data.doa_allocations && data.doa_allocations.length > 0) {
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

          if (doaTotal > newAmount) {
            throw new Error('Total DOA allocations cannot exceed transaction amount');
          }
        }
      }

      await queryRunner.commitTransaction();

      // Fetch fresh updated tx with relations
      return await this.getTransactionById(userId, txId);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async deleteTransaction(userId: number, txId: number) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const tx = await queryRunner.manager.findOne(Transaction, {
        where: { id: txId, user: { id: userId } },
        relations: { account: true }
      });
      if (!tx) throw new Error('Transaction not found');

      const amount = Number(tx.amount);
      const type = tx.type;
      const account = tx.account;

      // Revert balance
      if (type === 'INCOME') {
        account.balance = Number(account.balance) - amount;
      } else if (type === 'EXPENSE' || type === 'TRANSFER') {
        account.balance = Number(account.balance) + amount;
      }
      await queryRunner.manager.save(account);

      // Delete the transaction (DoaAllocations are deleted automatically due to cascade delete)
      await queryRunner.manager.remove(tx);

      await queryRunner.commitTransaction();
      return { message: 'Transaction deleted successfully' };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}

