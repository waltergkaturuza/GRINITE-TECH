import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class AnalyticsSchemaBootstrap implements OnApplicationBootstrap {
  private readonly logger = new Logger(AnalyticsSchemaBootstrap.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    if (process.env.NODE_ENV !== 'production') return;
    try {
      await this.dataSource.query(
        `ALTER TABLE page_views ADD COLUMN IF NOT EXISTS "countryCode" VARCHAR`,
      );
      this.logger.log('Analytics schema looks current');
    } catch (error) {
      this.logger.error(
        'Analytics schema bootstrap failed',
        error instanceof Error ? error.stack : error,
      );
    }
  }
}
