import { User } from 'src/user/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Journal {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.journals)
  user: User;

  @CreateDateColumn({ type: 'date' })
  date: Date;

  @Column()
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  debit: number;

  @Column('decimal', { precision: 10, scale: 2 })
  credit: number;

  @Column('decimal', { precision: 10, scale: 2 })
  totalBalance: number;
}
