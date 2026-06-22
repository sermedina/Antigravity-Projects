import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Investment } from './Investment';
import { Transaction } from './Transaction';

@Entity('investment_transactions')
export class InvestmentTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Investment, (inv: Investment) => inv.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'investment_id' })
  investment: Investment;

  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @Column({ type: 'varchar', length: 20 })
  type: string; // 'CONTRIBUTION', 'WITHDRAWAL', 'RETURN'

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
