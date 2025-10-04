import { PartialType } from '@nestjs/mapped-types';
import { IsOptional, IsNumber } from 'class-validator';
import { CreateProjectDto } from './create-project.dto';

export class UpdateProjectDto extends PartialType(CreateProjectDto) {
  @IsOptional()
  @IsNumber()
  actualHours?: number;

  @IsOptional()
  @IsNumber()
  completionPercentage?: number;
}