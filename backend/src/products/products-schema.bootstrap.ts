import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { DataSource } from 'typeorm'

@Injectable()
export class ProductsSchemaBootstrap implements OnApplicationBootstrap {
  private readonly logger = new Logger(ProductsSchemaBootstrap.name)

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    if (process.env.NODE_ENV !== 'production') return
    try {
      await this.syncSchema()
    } catch (error) {
      this.logger.error(
        'Products schema bootstrap failed',
        error instanceof Error ? error.stack : error,
      )
    }
  }

  private async syncSchema() {
    const alters = [
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS "imageUrl" VARCHAR`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'physical'`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS "recurringInterval" VARCHAR`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS features TEXT`,
      `ALTER TABLE products ADD COLUMN IF NOT EXISTS "digitalFiles" TEXT`,
    ]
    for (const sql of alters) {
      await this.dataSource.query(sql)
    }
    this.logger.log('Products schema looks current')
  }
}
