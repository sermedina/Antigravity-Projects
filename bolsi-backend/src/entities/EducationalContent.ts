import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('educational_content')
export class EducationalContent {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'varchar', length: 20 })
  type: string; // 'ARTICLE', 'VIDEO', 'COURSE'

  @Column({ type: 'text', nullable: true })
  body: string;

  @Column({ type: 'text', nullable: true })
  media_url: string;

  @Column({ type: 'varchar', length: 20, default: 'DRAFT' })
  status: string; // 'DRAFT', 'PUBLISHED'

  @Column({ type: 'integer', nullable: true })
  estimated_read_time: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  created_at: Date;
}
