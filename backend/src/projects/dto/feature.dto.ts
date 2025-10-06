import { IsString, IsOptional, IsEnum, IsNumber, IsBoolean } from 'class-validator';
import { FeatureStatus, FeaturePriority } from '../entities/feature.entity';

export class CreateFeatureDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(FeatureStatus)
  @IsOptional()
  status?: FeatureStatus;

  @IsEnum(FeaturePriority)
  @IsOptional()
  priority?: FeaturePriority;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @IsNumber()
  @IsOptional()
  estimatedHours?: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsString()
  moduleId: string;
}

export class UpdateFeatureDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(FeatureStatus)
  @IsOptional()
  status?: FeatureStatus;

  @IsEnum(FeaturePriority)
  @IsOptional()
  priority?: FeaturePriority;

  @IsNumber()
  @IsOptional()
  orderIndex?: number;

  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @IsNumber()
  @IsOptional()
  estimatedHours?: number;

  @IsNumber()
  @IsOptional()
  actualHours?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class ToggleFeatureDto {
  @IsBoolean()
  isCompleted: boolean;
}
