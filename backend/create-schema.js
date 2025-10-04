const { Client } = require('pg');

// Database connection
const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_BSxyR0PiM9Fd@ep-holy-frog-ade6mw5t-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function createDatabaseSchema() {
  try {
    await client.connect();
    console.log('📦 Connected to database');

    // Create users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR UNIQUE NOT NULL,
        password VARCHAR NOT NULL,
        "firstName" VARCHAR NOT NULL,
        "lastName" VARCHAR NOT NULL,
        phone VARCHAR,
        company VARCHAR,
        role TEXT DEFAULT 'client',
        status TEXT DEFAULT 'active',
        avatar VARCHAR,
        "emailVerified" BOOLEAN DEFAULT false,
        "twoFactorSecret" VARCHAR,
        "twoFactorEnabled" BOOLEAN DEFAULT false,
        "lastLoginAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create projects table
    await client.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'pending',
        "startDate" DATE,
        "endDate" DATE,
        budget DECIMAL(10,2),
        "clientId" UUID REFERENCES users(id),
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create products table
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        category VARCHAR,
        "imageUrl" VARCHAR,
        "inStock" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create payments table
    await client.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        amount DECIMAL(10,2) NOT NULL,
        currency VARCHAR DEFAULT 'USD',
        status TEXT DEFAULT 'pending',
        "stripePaymentId" VARCHAR,
        "userId" UUID REFERENCES users(id),
        "projectId" UUID REFERENCES projects(id),
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create chat_sessions table (using snake_case for table name)
    await client.query(`
      CREATE TABLE IF NOT EXISTS chat_sessions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "sessionId" VARCHAR UNIQUE NOT NULL,
        "userId" UUID REFERENCES users(id),
        messages JSONB DEFAULT '[]',
        "lastMessageAt" TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log('✅ Database schema created successfully!');
    console.log('📋 Tables created:');
    console.log('   • users');
    console.log('   • projects');
    console.log('   • products');
    console.log('   • payments');
    console.log('   • chat_sessions');

  } catch (error) {
    console.error('❌ Error creating schema:', error.message);
  } finally {
    await client.end();
  }
}

createDatabaseSchema();