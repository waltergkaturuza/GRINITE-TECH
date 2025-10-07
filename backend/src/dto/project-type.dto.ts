import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator'

export class CreateProjectTypeDto {
  @IsString()
  value: string

  @IsString()
  label: string

  @IsString()
  category: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  icon?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true

  @IsOptional()
  @IsBoolean()
  isCustom?: boolean = true

  @IsOptional()
  @IsNumber()
  orderIndex?: number = 0
}

export class UpdateProjectTypeDto {
  @IsOptional()
  @IsString()
  value?: string

  @IsOptional()
  @IsString()
  label?: string

  @IsOptional()
  @IsString()
  category?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  icon?: string

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsNumber()
  orderIndex?: number
}