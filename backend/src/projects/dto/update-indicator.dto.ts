import { IsString, IsNumber, IsOptional, IsIn, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateIndicatorProgressDto {
  @IsString()
  indicatorId: string;

  @IsOptional()
  @IsNumber()
  currentValue?: number;

  @IsOptional()
  @IsNumber()
  incrementBy?: number;

  @IsOptional()
  @IsIn(['on_track', 'behind', 'ahead', 'completed'])
  status?: 'on_track' | 'behind' | 'ahead' | 'completed';

  @IsOptional()
  @IsString()
  notes?: string;
}

export class BulkUpdateIndicatorsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateIndicatorProgressDto)
  updates: UpdateIndicatorProgressDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
