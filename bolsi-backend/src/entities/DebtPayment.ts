import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Debt } from './Debt';
import { Transaction } from './Transaction';

@Entity('debt_payments')
export class DebtPayment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Debt, (debt: Debt) => debt.payments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'debt_id' })
  debt: Debt;

  @ManyToOne(() => Transaction, { nullable: true })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  payment_date: Date;
}
