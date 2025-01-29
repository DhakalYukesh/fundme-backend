import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: 'user' })
  role: 'admin' | 'user';

  @Column({ default: false })
  is2FAEnabled: boolean;

  @Column({ nullable: true })
  twoFASecret: string;
}
