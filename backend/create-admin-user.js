const axios = require('axios');

async function createAdminUser() {
  try {
    console.log('🚀 Creating admin user in production...');

    const adminData = {
      email: 'admin@granitetech.com',
      password: 'GraniteTech2024!',
      firstName: 'System',
      lastName: 'Administrator',
      company: 'GRANITE TECH'
    };

    // Register admin user on production backend
    const response = await axios.post('https://granite-tech-backend.vercel.app/api/v1/auth/register', adminData);
    
    console.log('✅ Admin user created successfully in production!');
    console.log('📧 Email: admin@granitetech.com');
    console.log('🔑 Password: GraniteTech2024!');
    console.log('🎯 Access Token:', response.data.access_token);
    console.log('');
    console.log('🎉 You can now login with these credentials on your deployed app!');

  } catch (error) {
    if (error.response?.data?.message === 'Email already exists') {
      console.log('⚠️  Admin user already exists in production!');
      console.log('📧 Email: admin@granitetech.com');
      console.log('🔑 Password: GraniteTech2024!');
    } else {
      console.error('❌ Error creating admin user:', error.response?.data || error.message);
      console.log('🔍 Full error details:', error.toJSON?.() || error);
    }
  }
}

createAdminUser();