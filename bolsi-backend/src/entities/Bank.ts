import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('banks')
export class Bank {
  @PrimaryColumn({ type: 'varchar', length: 4 })
  code: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'logo_url' })
  logoUrl: string;
}
