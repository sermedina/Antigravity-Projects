import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Transaction } from './Transaction';
import { Bank } from './Bank';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // 'BANK', 'CASH', 'CREDIT_CARD'

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.00 })
  balance: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @ManyToOne(() => Bank, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'bank_code' })
  bank: Bank | null;

  @OneToMany(() => Transaction, (transaction: Transaction) => transaction.account)
  transactions: Transaction[];
}
