import { IsString, IsOptional, IsNumber, IsDateString, IsEnum } from 'class-validator';
import { ProjectStatus } from '../entities/project.entity';

export class CreateProjectDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  projectCode?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  projectGoal?: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsNumber()
  estimatedHours?: number;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsNumber()
  totalBudget?: number;

  @IsOptional()
  @IsString()
  fundingSource?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}