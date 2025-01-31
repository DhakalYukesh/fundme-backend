import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Journal } from 'src/journal/entities/journal.entity';
import { LedgerService } from './ledger.service';
import { LedgerController } from './ledger.controller';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from 'src/auth/auth.module';
import { User } from 'src/user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Journal, User]), AuthModule, JwtModule],
  providers: [LedgerService],
  controllers: [LedgerController],
})
export class LedgerModule {}
