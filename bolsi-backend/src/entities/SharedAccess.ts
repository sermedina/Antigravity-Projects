import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './User';

@Entity('shared_access')
@Unique(['owner', 'guest'])
export class SharedAccess {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, user => user.granted_accesses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: User;

  @ManyToOne(() => User, user => user.received_accesses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'guest_id' })
  guest: User;

  @Column({ type: 'varchar', length: 50, default: 'READ_ONLY' })
  access_level: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
