'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { authAPI } from '@/lib/api'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const data = await authAPI.login(email, password)
      localStorage.setItem('token', data.access_token)
      localStorage.setItem('user', JSON.stringify(data.user))
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-granite-800 via-jungle-900 to-crimson-900 flex items-center justify-center p-4 overflow-hidden relative">
      {/* Animated Circle Background */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          {/* Outer rotating ring */}
          <div className="w-96 h-96 border-4 border-transparent rounded-full animate-spin-slow">
            <div className="w-full h-full border-4 border-dashed border-t-cyan-400 border-r-cyan-500 border-b-blue-400 border-l-blue-500 rounded-full animate-spin-reverse opacity-60"></div>
          </div>
          
          {/* Middle ring */}
          <div className="absolute top-8 left-8 w-80 h-80 border-2 border-transparent rounded-full animate-spin-slow-reverse">
            <div className="w-full h-full border-2 border-dotted border-t-yellow-400 border-r-peach-400 border-b-yellow-500 border-l-peach-500 rounded-full animate-spin opacity-50"></div>
          </div>
          
          {/* Inner ring */}
          <div className="absolute top-16 left-16 w-64 h-64 border-2 border-transparent rounded-full animate-pulse">
            <div className="w-full h-full border-2 border-solid border-t-jungle-400 border-r-olive-400 border-b-jungle-500 border-l-olive-500 rounded-full animate-spin-slow opacity-40"></div>
          </div>
          
          {/* Center glow */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gradient-to-r from-cyan-400/20 to-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
        </div>
      </div>

      {/* Login Form Container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-yellow-400 mb-2 animate-pulse">
              GRANITE TECH
            </h1>
          </Link>
          <p className="text-gray-300 text-lg">Welcome back</p>
        </div>

        {/* Login Form */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20 relative overflow-hidden">
          {/* Form background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-yellow-500/5 rounded-2xl"></div>
          
          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white text-center mb-6">Login</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-crimson-900/20 border border-crimson-900/50 text-crimson-200 px-4 py-3 rounded-lg animate-shake">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="relative group">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 group-hover:bg-white/15"
                  />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 to-yellow-400/0 group-focus-within:from-cyan-400/10 group-focus-within:to-yellow-400/10 transition-all duration-300 pointer-events-none"></div>
                </div>

                <div className="relative group">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 group-hover:bg-white/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-cyan-400 transition-colors duration-200"
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 to-yellow-400/0 group-focus-within:from-cyan-400/10 group-focus-within:to-yellow-400/10 transition-all duration-300 pointer-events-none"></div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center text-gray-300">
                  <input
                    type="checkbox"
                    className="rounded border-gray-600 text-cyan-400 focus:ring-cyan-400 focus:ring-offset-0 bg-white/10"
                  />
                  <span className="ml-2">Remember me</span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-cyan-400 hover:text-yellow-400 transition-colors duration-200"
                >
                  Forgot your password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-cyan-500 to-yellow-500 hover:from-cyan-400 hover:to-yellow-400 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-cyan-500/25 relative overflow-hidden group"
              >
                <span className="relative z-10">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing in...
                    </div>
                  ) : (
                    'Login'
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            </form>

            {/* Social Login Options */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-transparent text-gray-400">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <button className="w-full inline-flex justify-center py-3 px-4 rounded-xl border border-white/20 bg-white/5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-200">
                  <span>Google</span>
                </button>
                <button className="w-full inline-flex justify-center py-3 px-4 rounded-xl border border-white/20 bg-white/5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-200">
                  <span>GitHub</span>
                </button>
              </div>
            </div>

            {/* Sign Up Link */}
            <div className="mt-8 text-center">
              <p className="text-gray-300">
                Don't have an account?{' '}
                <Link
                  href="/signup"
                  className="text-cyan-400 hover:text-yellow-400 font-medium transition-colors duration-200"
                >
                  Signup
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}