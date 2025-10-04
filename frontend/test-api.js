// Test script to check API connection from frontend
const testAPI = async () => {
  console.log('Testing API connection...');
  
  // Check environment variables
  console.log('Environment variables:');
  console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);
  console.log('NODE_ENV:', process.env.NODE_ENV);
  
  // Test API URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  console.log('Using API URL:', apiUrl);
  
  try {
    // Test health endpoint
    console.log('Testing health endpoint...');
    const healthResponse = await fetch(`${apiUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('Health check response:', healthData);
    
    // Test login endpoint
    console.log('Testing login endpoint...');
    const loginResponse = await fetch(`${apiUrl}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin@granitetech.com',
        password: 'GraniteTech2024!'
      })
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('Login successful:', loginData);
    } else {
      const loginError = await loginResponse.json();
      console.log('Login failed:', loginError);
    }
    
  } catch (error) {
    console.error('API test failed:', error);
  }
};

// Run the test
testAPI();