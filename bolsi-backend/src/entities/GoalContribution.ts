import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Goal } from './Goal';
import { Transaction } from './Transaction';

@Entity('goal_contributions')
export class GoalContribution {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Goal, (goal: Goal) => goal.contributions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'goal_id' })
  goal: Goal;

  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  contributed_at: Date;
}
