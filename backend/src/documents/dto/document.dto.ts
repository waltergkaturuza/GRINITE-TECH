import { Transform, Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import {
  COMPANY_DOCUMENT_CATEGORIES,
  PROJECT_DOCUMENT_CATEGORIES,
} from '../entities/company-document.entity';

const ALL_CATEGORIES = [
  ...new Set([...COMPANY_DOCUMENT_CATEGORIES, ...PROJECT_DOCUMENT_CATEGORIES]),
];

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value;

export class CreateCompanyDocumentDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsIn(ALL_CATEGORIES)
  category: string;

  @IsOptional()
  @IsIn(['company', 'project'])
  scope?: 'company' | 'project';

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsString()
  pathname: string;

  @IsNotEmpty()
  @IsString()
  originalName: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;
}

export class UpdateCompanyDocumentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsIn(ALL_CATEGORIES)
  category?: string;
}
