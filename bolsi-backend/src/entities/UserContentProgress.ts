import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { User } from './User';
import { EducationalContent } from './EducationalContent';

@Entity('user_content_progress')
@Unique(['user', 'content'])
export class UserContentProgress {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => EducationalContent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'content_id' })
  content: EducationalContent;

  @Column({ type: 'integer', default: 0 })
  progress_percentage: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completed_at: Date | null;
}
