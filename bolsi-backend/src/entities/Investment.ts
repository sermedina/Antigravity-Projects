import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { InvestmentTransaction } from './InvestmentTransaction';

@Entity('investments')
export class Investment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'varchar', length: 50 })
  asset_type: string; // 'STOCK', 'CRYPTO', 'REAL_ESTATE', 'OTHER'

  @Column({ type: 'varchar', length: 100, nullable: true })
  platform: string;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.00 })
  current_value: string;

  @OneToMany(() => InvestmentTransaction, (tx: InvestmentTransaction) => tx.investment)
  transactions: InvestmentTransaction[];
}
