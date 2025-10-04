const { Client } = require('pg');

async function checkUsers() {
  const client = new Client({
    connectionString: 'postgresql://neondb_owner:npg_BSxyR0PiM9Fd@ep-holy-frog-ade6mw5t-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require',
  });

  try {
    await client.connect();
    console.log('Connected to database');
    
    // Check users
    const usersQuery = 'SELECT id, email, role, "createdAt" FROM users ORDER BY "createdAt" DESC';
    const users = await client.query(usersQuery);
    
    console.log(`Found ${users.rows.length} users:`);
    users.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Email: ${user.email}, Role: ${user.role}, Created: ${user.createdAt}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.end();
  }
}

checkUsers();