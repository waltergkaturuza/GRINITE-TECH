const { Client } = require('pg');

// Test database connection
async function testDatabaseConnection() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_BSxyR0PiM9Fd@ep-holy-frog-ade6mw5t-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  });

  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('✅ Database connection successful!');
    
    // Test query
    const result = await client.query('SELECT NOW() as current_time');
    console.log('Current database time:', result.rows[0].current_time);
    
    // Check if users table exists
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const tables = await client.query(tablesQuery);
    console.log('Available tables:', tables.rows.map(row => row.table_name));
    
    // Check users count if table exists
    if (tables.rows.some(row => row.table_name === 'user')) {
      const userCount = await client.query('SELECT COUNT(*) as count FROM "user"');
      console.log('Users in database:', userCount.rows[0].count);
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await client.end();
  }
}

testDatabaseConnection();