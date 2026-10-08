import { Transform, Type } from 'class-transformer';
import { IsIn, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID, Min, ValidateIf } from 'class-validator';
import {
  COMPANY_DOCUMENT_CATEGORIES,
  PROJECT_DOCUMENT_CATEGORIES,
} from '../entities/company-document.entity';

const ALL_CATEGORIES = [
  ...new Set([...COMPANY_DOCUMENT_CATEGORIES, ...PROJECT_DOCUMENT_CATEGORIES]),
];

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value;

const blankToUndefined = ({ value }: { value: unknown }) => (value === '' ? undefined : value);

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

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
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

  @IsOptional()
  @IsIn(['company', 'project'])
  scope?: 'company' | 'project';

  @Transform(blankToUndefined)
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== '')
  @IsUUID()
  projectId?: string | null;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsString()
  pathname?: string;

  @IsOptional()
  @IsString()
  originalName?: string;

  @Type(() => Number)
  @IsOptional()
  @IsNumber()
  @Min(0)
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
