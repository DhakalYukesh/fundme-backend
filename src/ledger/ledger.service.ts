import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Journal } from 'src/journal/entities/journal.entity';
import { Between, Repository } from 'typeorm';

interface LedgerTotals {
  totalDebits: string | undefined;
  totalCredits: string | undefined;
  totalBalance: string | undefined;
}

export interface LedgerResult {
  openingBalance: number;
  totalDebits: number;
  totalCredits: number;
  closingBalance: number;
}

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(Journal) private journalRepository: Repository<Journal>,
  ) {}

  async generateLedger(
    userId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<LedgerResult> {
    // 1. Fetch the opening balance
    const openingBalanceQueryBuilder = this.journalRepository
      .createQueryBuilder('journal')
      .innerJoin('journal.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('journal.date < :startDate', { startDate })
      .orderBy('journal.date', 'DESC')
      .addOrderBy('journal.id', 'DESC');

    const openingBalanceEntry = await openingBalanceQueryBuilder.getOne();
    const openingBalance = openingBalanceEntry?.totalBalance ?? 0;

    // 2. Fetch the journal entries and totals
    const [journal, totals] = await Promise.all([
      this.journalRepository.find({
        relations: ['user'],
        where: {
          user: { id: userId },
          date: Between(startDate, endDate),
        },
        order: { date: 'ASC', id: 'ASC' },
      }),
      this.journalRepository
        .createQueryBuilder('journal')
        .innerJoin('journal.user', 'user')
        .select('COALESCE(SUM(journal.debit), 0)', 'totalDebits')
        .addSelect('COALESCE(SUM(journal.credit), 0)', 'totalCredits')
        .where('user.id = :userId', { userId })
        .andWhere('journal.date BETWEEN :startDate AND :endDate', {
          startDate,
          endDate,
        })
        .getRawOne<LedgerTotals>(),
    ]);

    // 3. Calculate the closing balance
    const closingBalance =
      journal.length > 0
        ? journal[journal.length - 1].totalBalance
        : openingBalance;

    return {
      openingBalance,
      totalDebits: Number(totals?.totalDebits ?? 0),
      totalCredits: Number(totals?.totalCredits ?? 0),
      closingBalance,
    };
  }
}
