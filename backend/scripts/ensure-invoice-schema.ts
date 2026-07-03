/**
 * Run against production Neon DB when invoice tables are missing or outdated:
 *   DATABASE_URL="postgresql://..." npx ts-node scripts/ensure-invoice-schema.ts
 */
import { Client } from 'pg';

async function fixEnumColumns(client: Client) {
  for (const col of ['status', 'payment_terms']) {
    const { rows } = await client.query(
      `SELECT data_type FROM information_schema.columns
       WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = $1`,
      [col],
    );
    if (rows[0]?.data_type === 'USER-DEFINED') {
      await client.query(
        `ALTER TABLE invoices ALTER COLUMN ${col} TYPE VARCHAR USING ${col}::text`,
      );
      console.log(`Converted invoices.${col} from enum to varchar`);
    }
  }
}

async function createTables(client: Client) {
  await client.query(`
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

  await client.query(`
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
}

async function addMissingColumns(client: Client) {
  const alters = [
    `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS parent_invoice_id INTEGER`,
    `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(10,2) DEFAULT 0`,
    `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS document_type VARCHAR DEFAULT 'invoice'`,
    `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_bank_branch VARCHAR`,
    `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_account_name VARCHAR`,
    `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_usd_account VARCHAR`,
    `ALTER TABLE invoices ADD COLUMN IF NOT EXISTS company_zig_account VARCHAR`,
    `ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS unit VARCHAR DEFAULT 'ea'`,
    `ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS discount_percent DECIMAL(5,2) DEFAULT 0`,
  ];
  for (const sql of alters) {
    await client.query(sql);
  }
}

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.error('Set DATABASE_URL');
    process.exit(1);
  }

  const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: false } });
  await client.connect();

  try {
    const { rows: tableRows } = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'invoices'
      ) AS exists
    `);

    if (!tableRows[0]?.exists) {
      console.log('Creating invoices tables...');
      await createTables(client);
      console.log('Done.');
      return;
    }

    await fixEnumColumns(client);

    const { rows: colRows } = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'invoices' AND column_name = 'amount_paid'
      ) AS exists
    `);

    if (colRows[0]?.exists) {
      const { rows: countRows } = await client.query('SELECT COUNT(*)::int AS count FROM invoices');
      console.log(`Schema OK. Invoice count: ${countRows[0]?.count ?? 0}`);
      return;
    }

    const { rows: countRows } = await client.query('SELECT COUNT(*)::int AS count FROM invoices');
    const rowCount = countRows[0]?.count ?? 0;

    if (rowCount > 0) {
      console.log(`Adding missing columns (${rowCount} existing rows)...`);
      await addMissingColumns(client);
    } else {
      console.log('Recreating empty outdated invoices tables...');
      await client.query('DROP TABLE IF EXISTS invoice_items CASCADE');
      await client.query('DROP TABLE IF EXISTS invoices CASCADE');
      await createTables(client);
    }

    const { rows: finalCount } = await client.query('SELECT COUNT(*)::int AS count FROM invoices');
    console.log(`Done. Invoice count: ${finalCount[0]?.count ?? 0}`);
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
