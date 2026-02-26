import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';

export class CreateLedgerEntryDto {
  @ApiProperty({ description: 'Account ID' })
  @IsString()
  accountId: string;

  @ApiProperty({ description: 'Entry date (ISO)' })
  @IsDateString()
  entryDate: string;

  @ApiProperty({ description: 'Entry type', enum: ['debit', 'credit'] })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Amount' })
  @IsNumber()
  amount: number;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Reference type', enum: ['manual', 'hosting_expense', 'invoice_payment', 'adjustment'] })
  @IsOptional()
  @IsString()
  referenceType?: string;

  @ApiPropertyOptional({ description: 'Reference ID' })
  @IsOptional()
  @IsString()
  referenceId?: string;
}
