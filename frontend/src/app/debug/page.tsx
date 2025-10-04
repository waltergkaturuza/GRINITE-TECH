'use client'

import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [config, setConfig] = useState({
    apiUrl: '',
    nodeEnv: '',
    buildTime: '',
  })

  useEffect(() => {
    setConfig({
      apiUrl: process.env.NEXT_PUBLIC_API_URL || 'Not set',
      nodeEnv: process.env.NODE_ENV || 'Not set',
      buildTime: new Date().toISOString(),
    })
  }, [])

  const testApi = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'
      const response = await fetch(`${apiUrl}/health`)
      const data = await response.json()
      console.log('API Response:', data)
      alert('API Test: ' + JSON.stringify(data))
    } catch (error) {
      console.error('API Test Error:', error)
      alert('API Test Failed: ' + error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Information</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Environment Configuration</h2>
          <div className="space-y-2">
            <p><strong>API URL:</strong> {config.apiUrl}</p>
            <p><strong>Node Environment:</strong> {config.nodeEnv}</p>
            <p><strong>Build Time:</strong> {config.buildTime}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">API Test</h2>
          <button 
            onClick={testApi}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Test API Connection
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Expected Configuration</h2>
          <div className="space-y-2 text-sm">
            <p><strong>Production API:</strong> https://grinite-tech-backend.vercel.app/api/v1</p>
            <p><strong>Local API:</strong> http://localhost:3001/api/v1</p>
          </div>
        </div>
      </div>
    </div>
  )
}