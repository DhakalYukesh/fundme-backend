import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Journal } from './entities/journal.entity';
import { DataSource, Repository } from 'typeorm';
import { JournalDto } from './dto/journal.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class JournalService {
  constructor(
    @InjectRepository(Journal) private journalRepository: Repository<Journal>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private dataSource: DataSource,
  ) {}

  async createJournal(
    userId: number,
    createJournalPayload: JournalDto,
  ): Promise<Journal | undefined> {
    // 1. Check if debit and credit are equal, if yes, setup the queryRunner
    if (createJournalPayload.debit !== createJournalPayload.credit) {
      throw new HttpException(
        'Debit and credit must be equal.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 2. Fetch the user entity
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
      });
      if (!user) {
        throw new HttpException('User not found.', HttpStatus.NOT_FOUND);
      }

      // 3. Find the last entry
      const lastEntry = await queryRunner.manager.findOne(Journal, {
        where: { user: { id: userId } },
        order: { id: 'DESC' },
      });

      const totalBalance =
        (lastEntry?.totalBalance || 0) +
        createJournalPayload.debit -
        createJournalPayload.credit;

      // 4. Save the new journal
      const newJournal = queryRunner.manager.create(Journal, {
        ...createJournalPayload,
        user,
        totalBalance,
      });

      // 5. Handle Transactions
      await queryRunner.manager.save(newJournal);
      await queryRunner.commitTransaction();
      return newJournal;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error(
        'Something went wrong while trying to create Journal: ',
        error,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getJournalEntries(
    userId: number,
    page: number = 1,
    limit: number = 10,
    startDate?: Date,
    endDate?: Date,
  ): Promise<Journal[]> {
    console.log('userId', userId);

    // 1. Fetch journal entries
    const query = this.journalRepository
      .createQueryBuilder('journal')
      .where('journal.userId = :userId', { userId })
      .skip((page - 1) * limit)
      .take(limit);

    // 2. Filter by date range
    if (startDate) {
      query.andWhere('journal.date >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('journal.date <= :endDate', { endDate });
    }

    // 3. Execute query
    return await query.getMany();
  }

  async updateJournalEntry(
    userId: number,
    journalId: number,
    updateJournalPayload: JournalDto,
  ): Promise<Journal> {
    // 1. Fetch the journal entry
    const journal = await this.journalRepository.findOne({
      where: { id: journalId, user: { id: userId } },
    });

    if (!journal) {
      throw new HttpException('Journal entry not found.', HttpStatus.NOT_FOUND);
    }

    // 2. Check if debit and credit are equal
    if (updateJournalPayload.debit !== updateJournalPayload.credit) {
      throw new HttpException(
        'Debit and credit should be equal.',
        HttpStatus.BAD_REQUEST,
      );
    }

    // 3. Update the journal entry
    const updateJournal = { ...journal, ...updateJournalPayload };

    // 4. Save the updated journal entry
    return this.journalRepository.save(updateJournal);
  }

  async deleteJournalEntry(userId: number, journalId: number): Promise<void> {
    // 1. Fetch the journal entry
    const journal = await this.journalRepository.findOne({
      where: { id: journalId, user: { id: userId } },
    });

    if (!journal) {
      throw new HttpException('Journal entry not found.', HttpStatus.NOT_FOUND);
    }

    // 2. Delete the journal entry
    await this.journalRepository.remove(journal);
  }
}
