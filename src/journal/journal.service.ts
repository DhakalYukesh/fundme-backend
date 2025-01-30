import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Journal } from './entities/journal.entity';
import { Repository } from 'typeorm';
import { JournalDto } from './dto/journal.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(Journal) private journalRepository: Repository<Journal>,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createJournal(
    userId: number,
    createJournalPayload: JournalDto,
  ): Promise<Journal> {
    // 1. Check if debit and credit are equal
    if (createJournalPayload.debit !== createJournalPayload.credit) {
      throw new HttpException(
        'Debit and credit should be equal.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 2. Fetch the User entity
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
    }

    // 3. Find last entry
    const lastEntry = await this.journalRepository.findOne({
      where: { user: { id: userId } },
      order: { id: 'DESC' },
    });

    // 4. Calculate total balance
    const totalBalance =
      (lastEntry?.totalBalance || 0) +
      createJournalPayload.debit -
      createJournalPayload.credit;

    // 5. Save journal entry
    return this.journalRepository.save({
      ...createJournalPayload,
      user,
      totalBalance,
    });
  }
}
