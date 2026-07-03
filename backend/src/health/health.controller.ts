import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { Invoice } from '../database/all-entities';

@Controller('health')
export class HealthController {
  constructor(
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {}

  @Get()
  async getHealth() {
    let invoicesTable = false;
    let invoiceCount: number | null = null;
    let invoiceEntityRegistered = false;

    try {
      invoiceEntityRegistered = this.dataSource.hasMetadata(Invoice);
    } catch {
      invoiceEntityRegistered = false;
    }

    if (this.configService.get('NODE_ENV') === 'production') {
      try {
        const tableCheck = await this.dataSource.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'invoices'
          ) AS exists
        `);
        invoicesTable = !!tableCheck[0]?.exists;
        if (invoicesTable) {
          const countResult = await this.dataSource.query('SELECT COUNT(*)::int AS count FROM invoices');
          invoiceCount = countResult[0]?.count ?? 0;
        }
      } catch {
        invoicesTable = false;
      }
    }

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: this.configService.get('NODE_ENV'),
      hasDatabase: !!this.configService.get('DATABASE_URL'),
      hasJwtSecret: !!this.configService.get('JWT_SECRET'),
      invoiceEntityRegistered,
      invoicesTable,
      invoiceCount,
    };
  }

  @Get('env')
  getEnvCheck() {
    return {
      NODE_ENV: this.configService.get('NODE_ENV'),
      hasDatabase: !!this.configService.get('DATABASE_URL'),
      hasJwtSecret: !!this.configService.get('JWT_SECRET'),
      corsOrigin: this.configService.get('CORS_ORIGIN'),
      databaseUrlPrefix: this.configService.get('DATABASE_URL')?.substring(0, 20) + '...',
    };
  }

  @Get('cors')
  checkCors() {
    return {
      status: 'ok',
      message: 'CORS is working',
      timestamp: new Date().toISOString(),
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With, Origin'
      }
    };
  }
}