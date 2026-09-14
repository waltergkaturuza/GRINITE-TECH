import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  InsightCategory,
  InsightKind,
  InsightStatus,
} from '../entities/insight-post.entity';

const KIND_VALUES = Object.values(InsightKind);
const CATEGORY_VALUES = Object.values(InsightCategory);
const STATUS_VALUES = Object.values(InsightStatus);

export class CreateInsightDto {
  @IsString()
  @MinLength(8)
  @MaxLength(180)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  excerpt?: string;

  @IsString()
  @MinLength(20)
  body: string;

  @IsOptional()
  @IsIn(KIND_VALUES)
  kind?: string;

  @IsOptional()
  @IsIn(CATEGORY_VALUES)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  coverImage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  tags?: string;

  @IsOptional()
  @IsIn(STATUS_VALUES)
  status?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  authorName?: string;

  @IsOptional()
  @IsEmail()
  authorEmail?: string;
}

export class UpdateInsightDto {
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(180)
  title?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  excerpt?: string;

  @IsOptional()
  @IsString()
  @MinLength(20)
  body?: string;

  @IsOptional()
  @IsIn(KIND_VALUES)
  kind?: string;

  @IsOptional()
  @IsIn(CATEGORY_VALUES)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  coverImage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  tags?: string;

  @IsOptional()
  @IsIn(STATUS_VALUES)
  status?: string;

  @IsOptional()
  @IsBoolean()
  featured?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  authorName?: string;
}

export class InsightFilterDto {
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  kind?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  featured?: boolean;
}

export class CreateCommentDto {
  @IsString()
  @MinLength(8)
  @MaxLength(4000)
  body: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  authorName?: string;

  @IsOptional()
  @IsEmail()
  authorEmail?: string;
}

export class CreateQuestionDto {
  @IsString()
  @MinLength(12)
  @MaxLength(180)
  title: string;

  @IsString()
  @MinLength(20)
  @MaxLength(8000)
  body: string;

  @IsOptional()
  @IsIn(CATEGORY_VALUES)
  category?: string;

  @IsOptional()
  @IsString()
  @MaxLength(400)
  tags?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  authorName?: string;

  @IsOptional()
  @IsEmail()
  authorEmail?: string;
}

export class VoteCommentDto {
  @Type(() => Number)
  @IsInt()
  @IsIn([-1, 1])
  value: number;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  voterKey?: string;
}

export class UpdateCommentDto {
  @IsOptional()
  @IsIn(['published', 'hidden'])
  status?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(4000)
  body?: string;
}

export class SubscribeInsightDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  name?: string;
}
