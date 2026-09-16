import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { DataSource, Repository } from 'typeorm'
import { CatalogService } from './entities/service.entity'
import { DEFAULT_CATALOG_SERVICES } from './default-services'

@Injectable()
export class ServicesSchemaBootstrap implements OnApplicationBootstrap {
  private readonly logger = new Logger(ServicesSchemaBootstrap.name)

  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(CatalogService)
    private readonly serviceRepo: Repository<CatalogService>,
  ) {}

  async onApplicationBootstrap() {
    if (process.env.NODE_ENV === 'production') {
      try {
        await this.syncSchema()
      } catch (error) {
        this.logger.error(
          'Catalog services schema bootstrap failed',
          error instanceof Error ? error.stack : error,
        )
      }
    }

    try {
      await this.seedIfEmpty()
    } catch (error) {
      this.logger.warn(
        `Catalog services seed skipped: ${error instanceof Error ? error.message : error}`,
      )
    }
  }

  private async tableExists(name: string) {
    const rows = await this.dataSource.query(
      `SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = $1
      ) AS exists`,
      [name],
    )
    return Boolean(rows[0]?.exists)
  }

  private async syncSchema() {
    if (await this.tableExists('catalog_services')) {
      this.logger.log('catalog_services table already exists')
      return
    }

    this.logger.log('Creating catalog_services table')
    await this.dataSource.query(`
      CREATE TABLE catalog_services (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title varchar(255) NOT NULL,
        description text NOT NULL,
        category varchar(255) NOT NULL,
        price decimal(10,2) NOT NULL DEFAULT 0,
        features text,
        icon varchar(255),
        status varchar(32) NOT NULL DEFAULT 'active',
        duration varchar(255),
        currency varchar(16) NOT NULL DEFAULT 'USD',
        "keyBenefits" text,
        "targetMarket" text,
        deliverables text,
        "setupFee" decimal(10,2),
        "monthlyFee" decimal(10,2),
        "displayOrder" integer NOT NULL DEFAULT 0,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `)
    await this.dataSource.query(
      `CREATE INDEX IF NOT EXISTS idx_catalog_services_status ON catalog_services (status, "displayOrder")`,
    )
  }

  private async seedIfEmpty() {
    const count = await this.serviceRepo.count()
    if (count > 0) return
    await this.serviceRepo.save(this.serviceRepo.create(DEFAULT_CATALOG_SERVICES))
    this.logger.log(`Seeded ${DEFAULT_CATALOG_SERVICES.length} catalog services`)
  }
}
