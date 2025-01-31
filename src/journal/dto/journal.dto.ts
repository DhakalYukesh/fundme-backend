import {
  IsNotEmpty,
  IsString,
  IsNumber,
  Min,
  MaxLength,
  MinLength,
} from 'class-validator';

export class JournalDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(255)
  description: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  debit: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  credit: number;
}
