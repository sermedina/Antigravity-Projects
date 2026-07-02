import { AppDataSource } from '../config/data-source';
import { Goal } from '../entities/Goal';
import { GoalContribution } from '../entities/GoalContribution';
import { Transaction } from '../entities/Transaction';

export class GoalService {
  private goalRepo = AppDataSource.getRepository(Goal);

  async createGoal(userId: number, data: any) {
    const goal = this.goalRepo.create({
      user: { id: userId },
      ...data
    } as Partial<Goal>);
    return await this.goalRepo.save(goal);
  }

  async contribute(userId: number, goalId: number, amount: number, transactionId?: number) {
    const queryRunner = AppDataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const goal = await queryRunner.manager.findOneBy(Goal, { id: goalId, user: { id: userId } });
      if (!goal) throw new Error('Goal not found');
      if (goal.status !== 'IN_PROGRESS') throw new Error('Goal is not in progress');

      let baseTx: Transaction | undefined = undefined;
      if (transactionId) {
        const foundTx = await queryRunner.manager.findOneBy(Transaction, { id: transactionId, user: { id: userId } });
        if (!foundTx) throw new Error('Associated transaction not found');
        baseTx = foundTx;
      }

      const contribution = queryRunner.manager.create(GoalContribution, {
        goal,
        transaction: baseTx,
        amount,
        contributed_at: new Date()
      });

      const saved = await queryRunner.manager.save(contribution);


      const updatedGoal = await queryRunner.manager.findOneBy(Goal, { id: goalId });


      if (updatedGoal && updatedGoal.current_amount >= Number(updatedGoal.target_amount)) {
        updatedGoal.status = 'COMPLETED';
        await queryRunner.manager.save(updatedGoal);
      }
      await queryRunner.commitTransaction();
      return { contribution: saved, updatedGoal };
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async getGoals(userId: number) {
    return await this.goalRepo.find({
      where: { user: { id: userId } },
      relations: { contributions: true },
      order: { deadline: 'ASC' }
    });
  }

  async getGoalById(userId: number, goalId: number) {
    const goal = await this.goalRepo.findOne({
      where: { id: goalId, user: { id: userId } },
      relations: { contributions: true }
    });
    if (!goal) throw new Error('Goal not found');
    return goal;
  }

  async updateGoal(userId: number, goalId: number, data: any) {
    const goal = await this.getGoalById(userId, goalId);

    if (data.name !== undefined) goal.name = data.name;
    if (data.description !== undefined) goal.description = data.description;
    if (data.target_amount !== undefined) goal.target_amount = data.target_amount;
    if (data.deadline !== undefined) goal.deadline = data.deadline;
    if (data.status !== undefined) goal.status = data.status;

    return await this.goalRepo.save(goal);
  }

  async deleteGoal(userId: number, goalId: number) {
    const goal = await this.goalRepo.findOneBy({ id: goalId, user: { id: userId } });
    if (!goal) throw new Error('Goal not found');
    await this.goalRepo.remove(goal);
    return { message: 'Goal deleted successfully' };
  }
}
