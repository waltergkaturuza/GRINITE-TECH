import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum } from 'class-validator';

export class CreateLedgerAccountDto {
  @ApiProperty({ description: 'Account name' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Account type', enum: ['bank', 'petty_cash', 'receivables', 'payables', 'other'] })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: 'Currency', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Opening balance', default: 0 })
  @IsOptional()
  @IsNumber()
  openingBalance?: number;

  @ApiPropertyOptional({ description: 'Description' })
  @IsOptional()
  @IsString()
  description?: string;
}
