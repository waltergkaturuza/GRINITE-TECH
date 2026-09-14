import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { InsightsService } from './insights.service';

@Injectable()
export class InsightsSchemaBootstrap implements OnApplicationBootstrap {
  private readonly logger = new Logger(InsightsSchemaBootstrap.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly insightsService: InsightsService,
  ) {}

  async onApplicationBootstrap() {
    try {
      if (process.env.NODE_ENV === 'production') {
        await this.syncSchema();
      }
      await this.insightsService.seedIfEmpty();
    } catch (error) {
      this.logger.error(
        'Insights schema bootstrap failed',
        error instanceof Error ? error.stack : error,
      );
    }
  }

  private async tableExists(name: string) {
    const rows = await this.dataSource.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      ) AS exists`,
      [name],
    );
    return Boolean(rows[0]?.exists);
  }

  private async syncSchema() {
    if (!(await this.tableExists('insight_posts'))) {
      this.logger.log('Creating insight_posts table');
      await this.dataSource.query(`
        CREATE TABLE insight_posts (
          id uuid PRIMARY KEY,
          slug varchar(255) NOT NULL UNIQUE,
          title varchar(500) NOT NULL,
          excerpt text,
          body text NOT NULL,
          kind varchar(32) NOT NULL DEFAULT 'article',
          category varchar(64) NOT NULL DEFAULT 'news',
          "coverImage" varchar(1000),
          tags text,
          status varchar(32) NOT NULL DEFAULT 'draft',
          featured boolean NOT NULL DEFAULT false,
          "authorName" varchar(255) NOT NULL DEFAULT 'Quantis Technologies',
          "authorEmail" varchar(255),
          "authorUserId" varchar(36),
          "viewCount" integer NOT NULL DEFAULT 0,
          "commentCount" integer NOT NULL DEFAULT 0,
          "publishedAt" timestamp,
          "createdAt" timestamp NOT NULL DEFAULT now(),
          "updatedAt" timestamp NOT NULL DEFAULT now()
        )
      `);
    }

    if (!(await this.tableExists('insight_comments'))) {
      this.logger.log('Creating insight_comments table');
      await this.dataSource.query(`
        CREATE TABLE insight_comments (
          id uuid PRIMARY KEY,
          "postId" uuid NOT NULL REFERENCES insight_posts(id) ON DELETE CASCADE,
          "parentId" uuid REFERENCES insight_comments(id) ON DELETE CASCADE,
          body text NOT NULL,
          "authorName" varchar(255) NOT NULL,
          "authorEmail" varchar(255),
          "authorUserId" varchar(36),
          "voteScore" integer NOT NULL DEFAULT 0,
          accepted boolean NOT NULL DEFAULT false,
          status varchar(32) NOT NULL DEFAULT 'published',
          "createdAt" timestamp NOT NULL DEFAULT now(),
          "updatedAt" timestamp NOT NULL DEFAULT now()
        )
      `);
    }

    if (!(await this.tableExists('insight_votes'))) {
      this.logger.log('Creating insight_votes table');
      await this.dataSource.query(`
        CREATE TABLE insight_votes (
          id uuid PRIMARY KEY,
          "commentId" uuid NOT NULL REFERENCES insight_comments(id) ON DELETE CASCADE,
          "userId" varchar(36),
          "voterKey" varchar(80) NOT NULL,
          value integer NOT NULL,
          "createdAt" timestamp NOT NULL DEFAULT now(),
          UNIQUE ("commentId", "voterKey")
        )
      `);
    }
  }
}
