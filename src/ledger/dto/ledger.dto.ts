import { IsDateString } from 'class-validator';

export class GenerateLedgerDto {
  @IsDateString()
  startDate: Date;

  @IsDateString()
  endDate: Date;
}
