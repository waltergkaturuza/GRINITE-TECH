import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyDocument } from './entities/company-document.entity';
import { Project } from '../projects/entities/project.entity';
import { DocumentsService } from './documents.service';
import { DocumentsController } from './documents.controller';
import { DocumentsSchemaBootstrap } from './documents-schema.bootstrap';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyDocument, Project])],
  controllers: [DocumentsController],
  providers: [DocumentsService, DocumentsSchemaBootstrap],
  exports: [DocumentsService],
})
export class DocumentsModule {}
