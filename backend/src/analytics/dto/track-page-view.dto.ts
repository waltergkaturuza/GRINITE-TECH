import { IsOptional, IsString } from 'class-validator';

export class TrackPageViewDto {
  @IsString()
  path: string;

  @IsOptional()
  @IsString()
  referrer?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  userId?: string;
}

