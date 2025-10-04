const axios = require('axios');

async function createTestUser() {
  try {
    console.log('🚀 Creating test user...');

    const userData = {
      email: 'admin@granitetech.com',
      password: 'admin123',
      firstName: 'Admin',
      lastName: 'User',
      company: 'GRANITE TECH'
    };

    console.log('📤 Sending request to:', 'https://grinite-tech-backend.vercel.app/api/v1/auth/register');
    console.log('📦 Data:', JSON.stringify(userData, null, 2));

    const response = await axios.post('https://grinite-tech-backend.vercel.app/api/v1/auth/register', userData, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
    console.log('✅ User created successfully!');
    console.log('📧 Email: admin@granitetech.com');
    console.log('🔑 Password: admin123');
    console.log('🎯 Response:', response.data);

  } catch (error) {
    console.log('❌ Error details:');
    if (error.response) {
      console.log('Status:', error.response.status);
      console.log('Data:', error.response.data);
      console.log('Headers:', error.response.headers);
    } else if (error.request) {
      console.log('No response received:', error.request);
    } else {
      console.log('Error:', error.message);
    }
  }
}

createTestUser();