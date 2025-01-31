import { Controller, Post, Query, UseGuards } from '@nestjs/common';
import { LedgerResult, LedgerService } from './ledger.service';
import { GetUser } from 'src/shared/decorators/user.decorator';
import { GenerateLedgerDto } from './dto/ledger.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';

@Controller('ledger')
@UseGuards(AuthGuard)
export class LedgerController {
  constructor(private ledgerService: LedgerService) {}

  @Post()
  generateLedger(
    @GetUser() user: { id: number },
    @Query() { startDate, endDate }: GenerateLedgerDto,
  ): Promise<LedgerResult> {
    console.log('userId', user.id);
    console.log('startDate', startDate);
    console.log('endDate', endDate);
    return this.ledgerService.generateLedger(user.id, startDate, endDate);
  }
}
