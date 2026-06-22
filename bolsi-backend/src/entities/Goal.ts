import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { GoalContribution } from './GoalContribution';

@Entity('goals')
export class Goal {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  target_amount: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0.00 })
  current_amount: number;

  @Column({ type: 'date', nullable: true })
  deadline: Date;

  @Column({ type: 'varchar', length: 20, default: 'IN_PROGRESS' })
  status: string; // 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'

  @OneToMany(() => GoalContribution, (contribution: GoalContribution) => contribution.goal)
  contributions: GoalContribution[];
}
