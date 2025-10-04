// Simple API test that can be run in browser console
// Copy and paste this into the browser console on https://grinite-tech-frontend.vercel.app

console.log('=== FRONTEND DEBUG INFO ===');
console.log('Current URL:', window.location.href);
console.log('NEXT_PUBLIC_API_URL:', process.env.NEXT_PUBLIC_API_URL);

// Test what API URL is actually being used
const testAPIUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';
  console.log('API URL that will be used:', apiUrl);
  
  // Try to fetch from the API
  fetch(`${apiUrl}/health`)
    .then(response => {
      console.log('Health check response status:', response.status);
      return response.json();
    })
    .then(data => {
      console.log('Health check data:', data);
    })
    .catch(error => {
      console.error('Health check failed:', error);
    });
};

testAPIUrl();