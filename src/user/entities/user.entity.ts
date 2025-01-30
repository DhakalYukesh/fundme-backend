import { Journal } from 'src/journal/entities/journal.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

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

  @OneToMany(() => Journal, (journal) => journal.user)
  journals: Journal[];
}
