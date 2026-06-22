import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany
} from 'typeorm';
import { Role } from './Role';
import { VerificationToken } from './VerificationToken';
import { SharedAccess } from './SharedAccess';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ default: false })
  is_email_verified: boolean;

  @Column({ type: 'varchar', length: 255 })
  password_hash: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  first_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  last_name: string;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: true })
  phone: string;

  @Column({ default: false })
  is_phone_verified: boolean;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 20, default: 'NATURAL' })
  user_type: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'role_id', referencedColumnName: 'id' }
  })
  roles: Role[];

  @OneToMany(() => VerificationToken, token => token.user)
  verification_tokens: VerificationToken[];

  @OneToMany(() => SharedAccess, access => access.owner)
  granted_accesses: SharedAccess[];

  @OneToMany(() => SharedAccess, access => access.guest)
  received_accesses: SharedAccess[];
}
