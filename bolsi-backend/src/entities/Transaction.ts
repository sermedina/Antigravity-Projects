import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Account } from './Account';
import { Category } from './Category';
import { DoaAllocation } from './DoaAllocation';

// Entidad principal de transacciones
@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Account, account => account.transactions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'account_id' })
  account: Account;

  @ManyToOne(() => Category, category => category.transactions, { nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 20 })
  type: string; // 'INCOME', 'EXPENSE', 'TRANSFER'

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'date' })
  transaction_date: Date;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @OneToMany(() => DoaAllocation, (allocation: DoaAllocation) => allocation.transaction)
  doa_allocations: DoaAllocation[];
}
