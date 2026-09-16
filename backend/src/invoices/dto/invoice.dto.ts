import { IsNotEmpty, IsNumber, IsString, IsOptional, IsEnum, IsArray, ValidateNested, IsDateString, Min } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { InvoiceStatus, PaymentTerms } from '../entities/invoice.entity';

const emptyToUndefined = ({ value }: { value: unknown }) =>
  value === '' || value === null ? undefined : value;

export class CreateInvoiceItemDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity: number;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unit_price: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tax_rate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_percent?: number;

  @IsOptional()
  @IsString()
  unit?: string;
}

export class CreateInvoiceDto {
  @IsNotEmpty()
  @IsString()
  client_id: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsString()
  project_id?: string;

  @IsOptional()
  @IsString()
  document_type?: 'invoice' | 'quotation' | 'receipt';

  @IsNotEmpty()
  @IsDateString()
  issue_date: string;

  @IsNotEmpty()
  @IsDateString()
  due_date: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsDateString()
  billing_period_start?: string;

  @Transform(emptyToUndefined)
  @IsOptional()
  @IsDateString()
  billing_period_end?: string;

  @IsOptional()
  @IsString()
  purchase_order?: string;

  @IsOptional()
  @IsEnum(PaymentTerms)
  payment_terms?: PaymentTerms;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tax_rate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  terms_conditions?: string;

  @IsOptional()
  @IsString()
  company_logo_url?: string;

  @IsOptional()
  @IsString()
  billing_address?: string;

  @IsOptional()
  @IsString()
  billing_email?: string;

  @IsOptional()
  @IsString()
  billing_phone?: string;

  @IsOptional()
  @IsString()
  payment_reference?: string;

  @IsOptional()
  @IsDateString()
  payment_date?: string;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsString()
  company_address?: string;

  @IsOptional()
  @IsString()
  company_email?: string;

  @IsOptional()
  @IsString()
  company_phone?: string;

  @IsOptional()
  @IsString()
  company_website?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  parent_invoice_id?: number;

  @IsOptional()
  @IsString()
  company_code?: string;

  @IsOptional()
  @IsString()
  company_vat_code?: string;

  @IsOptional()
  @IsString()
  company_bank_name?: string;

  @IsOptional()
  @IsString()
  company_bank_branch?: string;

  @IsOptional()
  @IsString()
  company_account_name?: string;

  @IsOptional()
  @IsString()
  company_usd_account?: string;

  @IsOptional()
  @IsString()
  company_zig_account?: string;

  @IsOptional()
  @IsString()
  company_swift?: string;

  @IsOptional()
  @IsString()
  company_iban?: string;

  @IsOptional()
  @IsString()
  buyer_company_code?: string;

  @IsOptional()
  @IsString()
  buyer_vat_code?: string;

  @IsOptional()
  @IsString()
  buyer_bank_name?: string;

  @IsOptional()
  @IsString()
  buyer_swift?: string;

  @IsOptional()
  @IsString()
  buyer_iban?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
}

export class UpdateInvoiceDto {
  @IsOptional()
  @IsString()
  client_id?: string;

  @IsOptional()
  @IsString()
  project_id?: string;

  @IsOptional()
  @IsString()
  document_type?: 'invoice' | 'quotation' | 'receipt';

  @IsOptional()
  @IsDateString()
  issue_date?: string;

  @IsOptional()
  @IsDateString()
  due_date?: string;

  @IsOptional()
  @IsDateString()
  billing_period_start?: string;

  @IsOptional()
  @IsDateString()
  billing_period_end?: string;

  @IsOptional()
  @IsString()
  purchase_order?: string;

  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @IsOptional()
  @IsEnum(PaymentTerms)
  payment_terms?: PaymentTerms;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  tax_rate?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  discount_amount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  terms_conditions?: string;

  @IsOptional()
  @IsString()
  company_logo_url?: string;

  @IsOptional()
  @IsString()
  billing_address?: string;

  @IsOptional()
  @IsString()
  billing_email?: string;

  @IsOptional()
  @IsString()
  billing_phone?: string;

  @IsOptional()
  @IsString()
  payment_reference?: string;

  @IsOptional()
  @IsDateString()
  payment_date?: string;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsString()
  company_name?: string;

  @IsOptional()
  @IsString()
  company_address?: string;

  @IsOptional()
  @IsString()
  company_email?: string;

  @IsOptional()
  @IsString()
  company_phone?: string;

  @IsOptional()
  @IsString()
  company_website?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  parent_invoice_id?: number;

  @IsOptional()
  @IsString()
  company_code?: string;

  @IsOptional()
  @IsString()
  company_vat_code?: string;

  @IsOptional()
  @IsString()
  company_bank_name?: string;

  @IsOptional()
  @IsString()
  company_bank_branch?: string;

  @IsOptional()
  @IsString()
  company_account_name?: string;

  @IsOptional()
  @IsString()
  company_usd_account?: string;

  @IsOptional()
  @IsString()
  company_zig_account?: string;

  @IsOptional()
  @IsString()
  company_swift?: string;

  @IsOptional()
  @IsString()
  company_iban?: string;

  @IsOptional()
  @IsString()
  buyer_company_code?: string;

  @IsOptional()
  @IsString()
  buyer_vat_code?: string;

  @IsOptional()
  @IsString()
  buyer_bank_name?: string;

  @IsOptional()
  @IsString()
  buyer_swift?: string;

  @IsOptional()
  @IsString()
  buyer_iban?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items?: CreateInvoiceItemDto[];
}

export class UpdateInvoiceStatusDto {
  @IsNotEmpty()
  @IsEnum(InvoiceStatus)
  status: InvoiceStatus;

  @IsOptional()
  @IsDateString()
  payment_date?: string;

  @IsOptional()
  @IsString()
  payment_method?: string;

  @IsOptional()
  @IsString()
  payment_reference?: string;
}

export class InvoiceStatsDto {
  total_invoices: number;
  total_revenue: number;
  paid_invoices: number;
  partially_paid_invoices: number;
  unpaid_invoices: number;
  pending_invoices: number;
  draft_invoices: number;
  overdue_invoices: number;
  monthly_revenue: number;
  monthly_growth: number;
  revenue_by_currency: { currency: string; total: number }[];
  monthly_by_currency: { currency: string; total: number }[];
}