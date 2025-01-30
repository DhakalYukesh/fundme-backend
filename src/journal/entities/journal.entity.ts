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

  @Column('numeric')
  debit: number;

  @Column('numeric')
  credit: number;

  @Column('numeric')
  totalBalance: number;
}
