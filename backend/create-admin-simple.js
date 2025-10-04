const { Client } = require('pg');
const bcrypt = require('bcrypt');

// Database connection
const client = new Client({
  connectionString: 'postgresql://neondb_owner:npg_BSxyR0PiM9Fd@ep-holy-frog-ade6mw5t-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  ssl: {
    rejectUnauthorized: false
  }
});

async function createAdminUser() {
  try {
    await client.connect();
    console.log('📦 Connected to database');

    // Check if admin exists
    const checkUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      ['admin@granitetech.com']
    );

    if (checkUser.rows.length > 0) {
      console.log('⚠️  Admin user already exists!');
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash('GraniteTech2024!', 12);

    // Create admin user
    await client.query(`
      INSERT INTO users (
        email, password, "firstName", "lastName", 
        phone, company, role, status, 
        "emailVerified", "twoFactorEnabled", 
        "createdAt", "updatedAt"
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
    `, [
      'admin@granitetech.com',
      hashedPassword,
      'System',
      'Administrator',
      '+1234567890',
      'GRANITE TECH',
      'ADMIN',
      'ACTIVE',
      true,
      false
    ]);

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@granitetech.com');
    console.log('🔑 Password: GraniteTech2024!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await client.end();
  }
}

createAdminUser();