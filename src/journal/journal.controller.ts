import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { JournalService } from './journal.service';
import { JournalDto } from './dto/journal.dto';
import { GetUser } from 'src/shared/decorators/user.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('journal')
export class JournalController {
  constructor(private journalService: JournalService) {}

  @Post()
  @UseGuards(AuthGuard)
  createJournal(
    @GetUser() user: { id: number },
    @Body() createJournalPayload: JournalDto,
  ) {
    return this.journalService.createJournal(user.id, createJournalPayload);
  }
}
