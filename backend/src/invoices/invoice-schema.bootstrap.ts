import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class InvoiceSchemaBootstrap implements OnModuleInit {
  private readonly logger = new Logger(InvoiceSchemaBootstrap.name);

  constructor(private readonly dataSource: DataSource) {}

  async onModuleInit() {
    if (process.env.NODE_ENV !== 'production') return;

    try {
      await this.ensureInvoiceSchema();
    } catch (error) {
      this.logger.error('Invoice schema bootstrap failed', error instanceof Error ? error.stack : error);
    }
  }

  private async ensureInvoiceSchema() {
    const tableExists = await this.dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'invoices'
      ) AS exists
    `);

    if (!tableExists[0]?.exists) {
      this.logger.log('Creating invoices tables...');
      await this.createTables();
      return;
    }

    const amountPaidExists = await this.dataSource.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'amount_paid'
      ) AS exists
    `);

    await this.fixEnumColumns();

    if (amountPaidExists[0]?.exists) {
      this.logger.log('Invoices schema looks current');
      return;
    }

    const countResult = await this.dataSource.query('SELECT COUNT(*)::int AS count FROM invoices');
    const rowCount = countResult[0]?.count ?? 0;

    if (rowCount > 0) {
      this.logger.warn(`Invoices table has old schema and ${rowCount} rows — run manual migration`);
      await this.addMissingColumns();
      return;
    }

    this.logger.log('Recreating empty invoices tables with current schema...');
    await this.dataSource.query('DROP TABLE IF EXISTS invoice_items CASCADE');
    await this.dataSource.query('DROP TABLE IF EXISTS invoices CASCADE');
    await this.createTables();
  }

  private async fixEnumColumns() {
    for (const col of ['status', 'payment_terms']) {
      const colInfo = await this.dataSource.query(
        `SELECT data_type FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = $1`,
        [col],
      );
      if (colInfo[0]?.data_type === 'USER-DEFINED') {
        await this.dataSource.query(
          `ALTER TABLE invoices ALTER COLUMN ${col} TYPE VARCHAR USING ${col}::text`,
        );
        this.logger.log(`Converted invoices.${col} from enum to varchar`);
      }
    }
  }

  private async addMissingColumns() {
    const alters = [
      `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS parent_invoice_id INTEGER`,
      `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0`,
      `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_bank_branch VARCHAR`,
      `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_account_name VARCHAR`,
      `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_usd_account VARCHAR`,
      `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_zig_account VARCHAR`,
      `ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS unit VARCHAR DEFAULT 'ea'`,
      `ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5,2) DEFAULT 0`,
    ];
    for (const sql of alters) {
      await this.dataSource.query(sql);
    }
    this.logger.log('Added missing invoice columns');
  }

  private async createTables() {
    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        invoice_number VARCHAR UNIQUE NOT NULL,
        client_id UUID NOT NULL,
        project_id UUID,
        parent_invoice_id INTEGER REFERENCES invoices(id) ON DELETE SET NULL,
        amount_paid DECIMAL(10,2) DEFAULT 0,
        document_type VARCHAR DEFAULT 'invoice',
        issue_date TIMESTAMP NOT NULL,
        due_date TIMESTAMP NOT NULL,
        status VARCHAR DEFAULT 'draft',
        payment_terms VARCHAR DEFAULT 'net_30',
        subtotal DECIMAL(10,2) NOT NULL,
        tax_rate DECIMAL(5,2) DEFAULT 0,
        tax_amount DECIMAL(10,2) DEFAULT 0,
        discount_amount DECIMAL(10,2) DEFAULT 0,
        total_amount DECIMAL(10,2) NOT NULL,
        notes TEXT,
        terms_conditions TEXT,
        payment_date TIMESTAMP,
        payment_method VARCHAR,
        payment_reference VARCHAR,
        billing_address TEXT,
        billing_email VARCHAR,
        billing_phone VARCHAR,
        company_name VARCHAR DEFAULT 'Quantis Technologies',
        company_logo_url VARCHAR,
        company_address TEXT,
        company_email VARCHAR,
        company_phone VARCHAR,
        company_website VARCHAR,
        company_code VARCHAR,
        company_vat_code VARCHAR,
        company_bank_name VARCHAR,
        company_bank_branch VARCHAR,
        company_account_name VARCHAR,
        company_usd_account VARCHAR,
        company_zig_account VARCHAR,
        company_swift VARCHAR,
        company_iban VARCHAR,
        buyer_company_code VARCHAR,
        buyer_vat_code VARCHAR,
        buyer_bank_name VARCHAR,
        buyer_swift VARCHAR,
        buyer_iban VARCHAR,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    await this.dataSource.query(`
      CREATE TABLE IF NOT EXISTS invoice_items (
        id SERIAL PRIMARY KEY,
        invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        description VARCHAR NOT NULL,
        unit VARCHAR DEFAULT 'ea',
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10,2) NOT NULL,
        total_price DECIMAL(10,2) NOT NULL,
        tax_rate DECIMAL(5,2),
        discount_percent DECIMAL(5,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `);

    this.logger.log('Invoices tables ready');
  }
}
