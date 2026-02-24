import { IsOptional, IsString } from 'class-validator';

export class TrackEventDto {
  @IsString()
  eventName: string;

  @IsString()
  page: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  userId?: string;

  @IsOptional()
  metadata?: Record<string, any>;
}

