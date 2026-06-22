import { AppDataSource } from '../config/data-source';
import { Debt } from '../entities/Debt';
import { DebtPayment } from '../entities/DebtPayment';
import { Transaction } from '../entities/Transaction';

export class DebtService {
  private debtRepo = AppDataSource.getRepository(Debt);
  private paymentRepo = AppDataSource.getRepository(DebtPayment);

  async createDebt(userId: number, data: any) {
    const debt = this.debtRepo.create({
      user: { id: userId },
      ...data,
      remaining_amount: data.total_amount
    });
    return await this.debtRepo.save(debt);
  }

  async payDebt(userId: number, debtId: number, amount: number, transactionId?: number) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const debt = await queryRunner.manager.findOneBy(Debt, { id: debtId, user: { id: userId } });
      if (!debt) throw new Error('Debt not found');

      let transaction: Transaction | undefined = undefined;
      if (transactionId) {
        const foundTx = await queryRunner.manager.findOneBy(Transaction, { id: transactionId, user: { id: userId } });
        if (!foundTx) throw new Error('Associated transaction not found');
        transaction = foundTx;
      }

      if (Number(debt.remaining_amount) < amount) {
        throw new Error('Payment amount exceeds remaining debt');
      }

      const payment = queryRunner.manager.create(DebtPayment, {
        debt,
        transaction,
        amount,
        payment_date: new Date()
      });

      const savedPayment = await queryRunner.manager.save(payment);

      // Obtener la deuda actualizada después del trigger
      const updatedDebt = await queryRunner.manager.findOneBy(Debt, { id: debtId });

      await queryRunner.commitTransaction();

      // Devolver ambos: el pago y la deuda actualizada
      return {
        payment: savedPayment,
        debt: updatedDebt,
        remaining_amount: updatedDebt?.remaining_amount
      };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getDebts(userId: number) {
    return await this.debtRepo.find({
      where: { user: { id: userId } },
      relations: { payments: true }
    });
  }
}