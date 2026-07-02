import { AppDataSource } from '../config/data-source';
import { Investment } from '../entities/Investment';
import { InvestmentTransaction } from '../entities/InvestmentTransaction';
import { Transaction } from '../entities/Transaction';

export class InvestmentService {
  private invRepo = AppDataSource.getRepository(Investment);
  private txRepo = AppDataSource.getRepository(InvestmentTransaction);

  async createInvestment(userId: number, data: any) {
    const inv = this.invRepo.create({
      user: { id: userId },
      ...data
    });
    return await this.invRepo.save(inv);
  }

  async addTransaction(userId: number, invId: number, data: any) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const investment = await queryRunner.manager.findOneBy(Investment, { id: invId, user: { id: userId } });
      if (!investment) throw new Error('Investment not found');

      let baseTx: Transaction | undefined = undefined;
      if (data.transaction_id) {
        const foundTx = await queryRunner.manager.findOneBy(Transaction, { id: data.transaction_id, user: { id: userId } });
        if (!foundTx) throw new Error('Associated transaction not found');
        baseTx = foundTx;
      }

      // Update current value based on type
      const amount = Number(data.amount);
      let currentValue = Number(investment.current_value);

      if (data.type === 'CONTRIBUTION' || data.type === 'RETURN') {
        currentValue += amount;
      } else if (data.type === 'WITHDRAWAL') {
        currentValue -= amount;
      }

      investment.current_value = currentValue.toString();
      await queryRunner.manager.save(investment);

      const invTx = queryRunner.manager.create(InvestmentTransaction, {
        investment,
        transaction: baseTx,
        type: data.type,
        amount
      });

      const savedTx = await queryRunner.manager.save(invTx);

      await queryRunner.commitTransaction();
      return savedTx;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getInvestments(userId: number) {
    return await this.invRepo.find({
      where: { user: { id: userId } },
      relations: { transactions: true }
    });
  }

  async getInvestmentById(userId: number, invId: number) {
    const inv = await this.invRepo.findOne({
      where: { id: invId, user: { id: userId } },
      relations: { transactions: true }
    });
    if (!inv) throw new Error('Investment not found');
    return inv;
  }

  async updateInvestment(userId: number, invId: number, data: any) {
    const inv = await this.getInvestmentById(userId, invId);

    if (data.name !== undefined) inv.name = data.name;
    if (data.asset_type !== undefined) inv.asset_type = data.asset_type;
    if (data.platform !== undefined) inv.platform = data.platform;
    if (data.current_value !== undefined) inv.current_value = data.current_value.toString();

    return await this.invRepo.save(inv);
  }

  async deleteInvestment(userId: number, invId: number) {
    const inv = await this.getInvestmentById(userId, invId);
    await this.invRepo.remove(inv);
    return { message: 'Investment deleted successfully' };
  }
}
