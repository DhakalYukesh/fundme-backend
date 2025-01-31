import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JournalService } from './journal.service';
import { JournalDto } from './dto/journal.dto';
import { GetUser } from 'src/shared/decorators/user.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { Journal } from './entities/journal.entity';

@Controller('journal')
@UseGuards(AuthGuard)
export class JournalController {
  constructor(private journalService: JournalService) {}

  @Post()
  createJournal(
    @GetUser() user: { id: number },
    @Body() createJournalPayload: JournalDto,
  ) {
    return this.journalService.createJournal(user.id, createJournalPayload);
  }

  @Get(':userId')
  getJournalEntriesById(
    @Param('userId') userId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<Journal[]> {
    console.log('userId', userId);

    return this.journalService.getJournalEntries(
      userId,
      Number(page),
      Number(limit),
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
    );
  }

  @Put(':journalId')
  updateJournalEntry(
    @GetUser() user: { id: number },
    @Param('journalId') journalId: number,
    @Body() updateJournalPayload: JournalDto,
  ) {
    return this.journalService.updateJournalEntry(
      user.id,
      journalId,
      updateJournalPayload,
    );
  }

  @Delete(':journalId')
  deleteJournalEntry(
    @GetUser() user: { id: number },
    @Param('journalId') journalId: number,
  ) {
    return this.journalService.deleteJournalEntry(user.id, journalId);
  }
}
