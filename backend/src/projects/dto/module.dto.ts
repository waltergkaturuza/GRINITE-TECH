import { IsString, IsOptional, IsEnum, IsNumber } from 'class-validator';
import { ModuleStatus } from '../entities/module.entity';

export class CreateModuleDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ModuleStatus)
  @IsOptional()
  status?: ModuleStatus;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @IsNumber()
  @IsOptional()
  progress?: number;

  @IsNumber()
  @IsOptional()
  estimatedHours?: number;

  @IsString()
  milestoneId: string;
}

export class UpdateModuleDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ModuleStatus)
  @IsOptional()
  status?: ModuleStatus;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @IsNumber()
  @IsOptional()
  progress?: number;

  @IsNumber()
  @IsOptional()
  estimatedHours?: number;

  @IsNumber()
  @IsOptional()
  actualHours?: number;
}
