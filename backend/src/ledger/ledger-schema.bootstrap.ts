import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { DataSource } from 'typeorm'

@Injectable()
export class LedgerSchemaBootstrap implements OnApplicationBootstrap {
  private readonly logger = new Logger(LedgerSchemaBootstrap.name)

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    if (process.env.NODE_ENV !== 'production') return
    try {
      await this.syncSchema()
    } catch (error) {
      this.logger.error(
        'Ledger schema bootstrap failed',
        error instanceof Error ? error.stack : error,
      )
    }
  }

  private async syncSchema() {
    const alters = [
      `ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS category VARCHAR`,
      `ALTER TABLE ledger_entries ADD COLUMN IF NOT EXISTS "projectId" uuid`,
    ]
    for (const sql of alters) {
      await this.dataSource.query(sql)
    }
    this.logger.log('Ledger schema looks current')
  }
}
