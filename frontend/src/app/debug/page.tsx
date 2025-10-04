'use client'

import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [config, setConfig] = useState({
    apiUrl: '',
    nodeEnv: '',
    buildTime: '',
    healthStatus: '',
    errorMessage: '',
  })

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'Not set'
    setConfig(prev => ({
      ...prev,
      apiUrl,
      nodeEnv: process.env.NODE_ENV || 'Not set',
      buildTime: new Date().toISOString(),
    }))

    // Test API health immediately
    testApiHealth(apiUrl)
  }, [])

  const testApiHealth = async (apiUrlOverride?: string) => {
    try {
      const apiUrl = apiUrlOverride || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
      console.log('Testing API at:', apiUrl)
      
      const response = await fetch(`${apiUrl}/health`)
      if (response.ok) {
        const data = await response.json()
        setConfig(prev => ({
          ...prev,
          healthStatus: `✅ Success: ${JSON.stringify(data)}`,
          errorMessage: ''
        }))
      } else {
        setConfig(prev => ({
          ...prev,
          healthStatus: `❌ Failed: ${response.status} ${response.statusText}`,
          errorMessage: `Response: ${response.status}`
        }))
      }
    } catch (error) {
      console.error('API Test Error:', error)
      setConfig(prev => ({
        ...prev,
        healthStatus: '❌ Network Error',
        errorMessage: error instanceof Error ? error.message : String(error)
      }))
    }
  }

  const testLogin = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
      console.log('Testing login at:', `${apiUrl}/auth/login`)
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@granitetech.com',
          password: 'GraniteTech2024!'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        alert('✅ Login successful! Token: ' + data.access_token.substring(0, 50) + '...')
      } else {
        const errorData = await response.json()
        alert('❌ Login failed: ' + JSON.stringify(errorData))
      }
    } catch (error) {
      alert('❌ Login error: ' + (error instanceof Error ? error.message : String(error)))
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-red-600">🚨 FRONTEND DEBUG</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>
          <div className="space-y-2 font-mono text-sm">
            <p><strong>API URL:</strong> 
              <span className={config.apiUrl === 'Not set' ? 'text-red-600 bg-red-100 px-2 py-1 rounded' : 'text-green-600 bg-green-100 px-2 py-1 rounded ml-2'}>
                {config.apiUrl}
              </span>
            </p>
            <p><strong>Node Environment:</strong> {config.nodeEnv}</p>
            <p><strong>Page Load Time:</strong> {config.buildTime}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Health Check</h2>
          <div className="space-y-2">
            <p><strong>Status:</strong> {config.healthStatus}</p>
            {config.errorMessage && (
              <p><strong>Error:</strong> <span className="text-red-600">{config.errorMessage}</span></p>
            )}
            <div className="flex gap-4 mt-4">
              <button 
                onClick={() => testApiHealth()}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                🔄 Retest Health
              </button>
              <button 
                onClick={() => testApiHealth('https://grinite-tech-backend.vercel.app/api/v1')}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                🎯 Test Production API
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Test</h2>
          <button 
            onClick={testLogin}
            className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
          >
            🔐 Test Admin Login
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Expected vs Actual</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Expected API URL:</strong> <code>https://grinite-tech-backend.vercel.app/api/v1</code></p>
            <p><strong>Actual API URL:</strong> <code>{config.apiUrl}</code></p>
            <div className="mt-4 p-4 bg-yellow-100 rounded">
              <p><strong>🚨 If API URL shows "Not set" or "localhost":</strong></p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Go to Vercel Dashboard → grinite-tech-frontend → Settings → Environment Variables</li>
                <li>Add: <code>NEXT_PUBLIC_API_URL = https://grinite-tech-backend.vercel.app/api/v1</code></li>
                <li>Redeploy the project</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}