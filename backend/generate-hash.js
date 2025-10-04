const bcrypt = require('bcrypt');

async function generateHash() {
  const password = 'GraniteTech2024!';
  const hash = await bcrypt.hash(password, 12);
  
  console.log('🔑 Password:', password);
  console.log('🔐 Bcrypt Hash:', hash);
  console.log('');
  console.log('📋 Use this hash in your SQL INSERT statement:');
  console.log(`'${hash}'`);
}

generateHash().catch(console.error);