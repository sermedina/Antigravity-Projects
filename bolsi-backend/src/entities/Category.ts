import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Transaction } from './Transaction';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 20 })
  type: string; // 'INCOME', 'EXPENSE', 'DOA'

  @Column({ type: 'varchar', length: 255, nullable: true })
  icon_url: string;

  @OneToMany(() => Transaction, (transaction: Transaction) => transaction.category)
  transactions: Transaction[];
}
