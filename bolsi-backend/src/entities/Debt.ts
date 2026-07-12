import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { DebtPayment } from './DebtPayment';

@Entity('debts')
export class Debt {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 100 })
  counterparty_name: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  total_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  remaining_amount: number;

  @Column({ type: 'varchar', length: 20 })
  debt_type: string; // 'I_OWE', 'THEY_OWE_ME'

  @Column({ type: 'date', nullable: true })
  due_date: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0.00 })
  interest_rate: number;

  @Column({ type: 'int', default: 5 })
  urgency: number;

  @OneToMany(() => DebtPayment, (payment: DebtPayment) => payment.debt)
  payments: DebtPayment[];
}
