import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DocumentsSchemaBootstrap implements OnApplicationBootstrap {
  private readonly logger = new Logger(DocumentsSchemaBootstrap.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    try {
      await this.syncSchema();
    } catch (error) {
      this.logger.error(
        'Documents schema bootstrap failed',
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
    if (!(await this.tableExists('company_documents'))) {
      this.logger.log('Creating company_documents table');
      await this.dataSource.query(`
        CREATE TABLE company_documents (
          id uuid PRIMARY KEY,
          title varchar(255) NOT NULL,
          description text,
          category varchar(64) NOT NULL DEFAULT 'other',
          scope varchar(32) NOT NULL DEFAULT 'company',
          "projectId" uuid,
          url text NOT NULL,
          pathname text NOT NULL,
          "originalName" varchar(500) NOT NULL,
          "fileSize" integer NOT NULL DEFAULT 0,
          "mimeType" varchar(255),
          "uploadedById" uuid,
          "createdAt" timestamp NOT NULL DEFAULT now(),
          "updatedAt" timestamp NOT NULL DEFAULT now()
        )
      `);
      await this.dataSource.query(
        `CREATE INDEX IF NOT EXISTS idx_company_documents_category ON company_documents (scope, category)`,
      );
      await this.dataSource.query(
        `CREATE INDEX IF NOT EXISTS idx_company_documents_project ON company_documents ("projectId")`,
      );
    }

    await this.dataSource.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_company_documents_project_url
      ON company_documents ("projectId", url)
      WHERE "projectId" IS NOT NULL
    `);
  }
}
