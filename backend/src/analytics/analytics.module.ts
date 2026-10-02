import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AnalyticsEvent, PageView } from './analytics.entity';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';
import { AnalyticsSchemaBootstrap } from './analytics-schema.bootstrap';

@Module({
  imports: [TypeOrmModule.forFeature([PageView, AnalyticsEvent])],
  controllers: [AnalyticsController],
  providers: [AnalyticsService, AnalyticsSchemaBootstrap],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}

