import { IsString, IsEmail, IsOptional, IsEnum, IsNumber, IsDateString } from 'class-validator';
import { RequestStatus, RequestPriority } from '../entities/request.entity';

export class CreateRequestDto {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  serviceInterested: string;

  @IsString()
  projectBudget: string;

  @IsString()
  projectTimeline: string;

  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority;
}

export class UpdateRequestDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  serviceInterested?: string;

  @IsOptional()
  @IsString()
  projectBudget?: string;

  @IsOptional()
  @IsString()
  projectTimeline?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(RequestStatus)
  status?: RequestStatus;

  @IsOptional()
  @IsEnum(RequestPriority)
  priority?: RequestPriority;

  @IsOptional()
  @IsNumber()
  estimatedBudget?: number;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsOptional()
  @IsDateString()
  estimatedStartDate?: string;

  @IsOptional()
  @IsDateString()
  estimatedEndDate?: string;

  @IsOptional()
  @IsString()
  adminNotes?: string;

  @IsOptional()
  @IsString()
  assignedToId?: string;
}

export class CreateMessageDto {
  @IsString()
  requestId: string;

  @IsString()
  senderName: string;

  @IsEmail()
  senderEmail: string;

  @IsString()
  senderType: 'client' | 'admin' | 'system';

  @IsString()
  message: string;

  @IsOptional()
  @IsString()
  isInternal?: boolean;
}