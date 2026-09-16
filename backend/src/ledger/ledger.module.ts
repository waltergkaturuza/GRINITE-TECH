import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LedgerAccount } from './entities/ledger-account.entity';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { LedgerService } from './ledger.service';
import { LedgerController } from './ledger.controller';
import { LedgerSchemaBootstrap } from './ledger-schema.bootstrap';
import { Project } from '../projects/entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([LedgerAccount, LedgerEntry, Project]),
  ],
  controllers: [LedgerController],
  providers: [LedgerSchemaBootstrap, LedgerService],
  exports: [LedgerService],
})
export class LedgerModule {}
