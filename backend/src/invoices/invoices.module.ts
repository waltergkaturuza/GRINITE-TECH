import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesService } from './invoices.service';
import { InvoicesController } from './invoices.controller';
import { InvoiceSchemaBootstrap } from './invoice-schema.bootstrap';
import { Invoice, InvoiceItem } from '../database/all-entities';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Invoice, InvoiceItem, User, Project])],
  controllers: [InvoicesController],
  providers: [InvoicesService, InvoiceSchemaBootstrap],
  exports: [InvoicesService],
})
export class InvoicesModule {}