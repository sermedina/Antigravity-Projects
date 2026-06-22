import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Transaction } from './Transaction';

@Entity('doa_allocations')
export class DoaAllocation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Transaction, (transaction: Transaction) => transaction.doa_allocations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @Column({ type: 'varchar', length: 50 })
  doa_type: string; // 'TITHE', 'OFFERING', 'SAVINGS'

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;
}
