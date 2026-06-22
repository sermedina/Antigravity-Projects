import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './User';

@Entity('verification_tokens')
export class VerificationToken {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.verification_tokens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  token: string;

  @Column({ type: 'varchar', length: 50 })
  type: string; // 'EMAIL_VERIFICATION', 'PHONE_VERIFICATION', 'PASSWORD_RECOVERY'

  @Column({ type: 'varchar', length: 20 })
  medium: string; // 'EMAIL', 'SMS'

  @Column({ type: 'timestamp with time zone' })
  expires_at: Date;

  @Column({ default: false })
  is_used: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
