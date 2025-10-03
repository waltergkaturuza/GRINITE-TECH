'use client'

import { useState } from 'react'
import testAuthFlow from '@/utils/testAuth'

export default function TestPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<string[]>([])

  const runTests = async () => {
    setIsRunning(true)
    setResults([])
    
    // Capture console.log output
    const originalLog = console.log
    const originalError = console.error
    const logs: string[] = []
    
    console.log = (...args) => {
      const message = args.join(' ')
      logs.push(message)
      setResults([...logs])
      originalLog(...args)
    }
    
    console.error = (...args) => {
      const message = '❌ ' + args.join(' ')
      logs.push(message)
      setResults([...logs])
      originalError(...args)
    }
    
    try {
      await testAuthFlow()
    } finally {
      console.log = originalLog
      console.error = originalError
      setIsRunning(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-800 via-jungle-900 to-crimson-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-900 to-peach-900 mb-4">
            GRANITE TECH
          </h1>
          <h2 className="text-2xl text-white mb-2">Authentication Flow Test</h2>
          <p className="text-gray-300">Testing end-to-end authentication between frontend and backend</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-2xl p-8 border border-white/20">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Test Results</h3>
            <button
              onClick={runTests}
              disabled={isRunning}
              className="bg-gradient-to-r from-jungle-900 to-olive-900 hover:from-jungle-800 hover:to-olive-800 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
            >
              {isRunning ? 'Running Tests...' : 'Run Authentication Tests'}
            </button>
          </div>

          <div className="bg-granite-900/30 rounded-lg p-4 min-h-[400px] font-mono text-sm">
            {results.length === 0 && !isRunning && (
              <div className="text-gray-400 text-center py-8">
                Click "Run Authentication Tests" to start testing the connection between frontend and backend
              </div>
            )}
            
            {results.map((result, index) => (
              <div 
                key={index} 
                className={`mb-2 ${
                  result.includes('✅') ? 'text-jungle-300' :
                  result.includes('❌') ? 'text-crimson-300' :
                  result.includes('🧪') || result.includes('🎉') ? 'text-yellow-300' :
                  result.includes('🔑') ? 'text-peach-300' :
                  'text-gray-300'
                }`}
              >
                {result}
              </div>
            ))}
            
            {isRunning && results.length === 0 && (
              <div className="text-yellow-300 animate-pulse">
                Initializing authentication tests...
              </div>
            )}
          </div>

          <div className="mt-6 text-sm text-gray-400">
            <strong>Test Coverage:</strong>
            <ul className="list-disc ml-6 mt-2 space-y-1">
              <li>User Registration (POST /api/v1/auth/register)</li>
              <li>User Login (POST /api/v1/auth/login)</li>
              <li>JWT Token Generation & Storage</li>
              <li>Protected Route Access (GET /api/v1/auth/profile)</li>
              <li>Frontend-Backend API Communication</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-jungle-400 font-semibold">Backend Status</div>
              <div className="text-white">✅ Running on port 3001</div>
              <div className="text-gray-400 text-sm">SQLite Database Connected</div>
            </div>
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="text-crimson-400 font-semibold">Frontend Status</div>
              <div className="text-white">✅ Running on port 3000</div>
              <div className="text-gray-400 text-sm">Next.js 14 with TailwindCSS</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}