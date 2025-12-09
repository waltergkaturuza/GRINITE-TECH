import { authAPI } from '../lib/api'

export const testAuthFlow = async () => {
  try {
    console.log('🧪 Testing Quantis Technologies Authentication Flow...')
    
    // Test Registration
    console.log('1. Testing user registration...')
    const registerData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@granitetech.com',
      password: 'SecurePassword123!',
      company: 'Test Company'
    }
    
    const registerResult = await authAPI.register(registerData)
    console.log('✅ Registration successful:', registerResult.user.email)
    
    // Test Login
    console.log('2. Testing user login...')
    const loginResult = await authAPI.login(registerData.email, registerData.password)
    console.log('✅ Login successful:', loginResult.user.email)
    console.log('🔑 JWT Token received:', loginResult.access_token.substring(0, 20) + '...')
    
    // Test Profile Access
    console.log('3. Testing profile access with JWT...')
    localStorage.setItem('token', loginResult.access_token)
    const profile = await authAPI.getProfile()
    console.log('✅ Profile access successful:', profile.email)
    
    console.log('🎉 All authentication tests passed!')
    return true
    
  } catch (error: any) {
    console.error('❌ Authentication test failed:', error.response?.data?.message || error.message)
    return false
  }
}

// Export for use in components
export default testAuthFlow