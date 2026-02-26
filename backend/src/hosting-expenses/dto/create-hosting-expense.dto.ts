import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsDateString,
  Min,
} from 'class-validator';

export class CreateHostingExpenseDto {
  @ApiPropertyOptional({ description: 'Project ID this expense is for' })
  @IsOptional()
  @IsUUID()
  projectId?: string;

  @ApiProperty({ description: 'Amount paid', example: 99.99 })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Currency', default: 'USD' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Hosting provider name', example: 'AWS' })
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional({ description: 'Billing period start (ISO date)' })
  @IsOptional()
  @IsDateString()
  billingPeriodStart?: string;

  @ApiPropertyOptional({ description: 'Billing period end (ISO date)' })
  @IsOptional()
  @IsDateString()
  billingPeriodEnd?: string;

  @ApiPropertyOptional({ description: 'Description of the expense' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Provider invoice/reference number' })
  @IsOptional()
  @IsString()
  invoiceReference?: string;

  @ApiPropertyOptional({ description: 'Date payment was made (ISO date)' })
  @IsOptional()
  @IsDateString()
  paymentDate?: string;

  @ApiPropertyOptional({ description: 'Payment method', example: 'Bank Transfer' })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiPropertyOptional({
    description: 'Status',
    enum: ['draft', 'paid', 'reimbursed', 'cancelled'],
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    description: 'Category',
    enum: ['hosting', 'domain', 'ssl', 'storage', 'other'],
  })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Link to provider dashboard or hosting panel' })
  @IsOptional()
  @IsString()
  hostingLink?: string;

  @ApiPropertyOptional({ description: 'Attachment URLs (url, name)[]' })
  @IsOptional()
  attachmentUrls?: { url: string; name: string }[];
}
