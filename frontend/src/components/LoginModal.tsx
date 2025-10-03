'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { authAPI } from '@/lib/api'
import Modal from './Modal'

interface LoginModalProps {
  isOpen: boolean
  closeModal: () => void
  openSignupModal: () => void
}

export default function LoginModal({ isOpen, closeModal, openSignupModal }: LoginModalProps) {
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
      closeModal()
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const switchToSignup = () => {
    closeModal()
    openSignupModal()
  }

  return (
    <Modal isOpen={isOpen} closeModal={closeModal} title="Login">
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
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 group-hover:bg-white/15 hover:border-cyan-400/50 focus:bg-white/20"
            />
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
              className="w-full px-4 py-3 pr-12 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent transition-all duration-300 group-hover:bg-white/15 hover:border-cyan-400/50 focus:bg-white/20"
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
          <button
            type="button"
            className="text-cyan-400 hover:text-yellow-400 transition-colors duration-200"
          >
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-cyan-500 to-yellow-500 hover:from-cyan-400 hover:to-yellow-400 text-white font-medium py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-cyan-500/25 relative overflow-hidden group"
        >
          <span className="relative z-10">
            {isLoading ? "Signing in..." : "Login"}
          </span>
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </button>

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
            <button type="button" className="w-full inline-flex justify-center py-3 px-4 rounded-xl border border-white/20 bg-white/5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-200">
              <span>Google</span>
            </button>
            <button type="button" className="w-full inline-flex justify-center py-3 px-4 rounded-xl border border-white/20 bg-white/5 text-sm font-medium text-gray-300 hover:bg-white/10 hover:border-cyan-400/50 transition-all duration-200">
              <span>GitHub</span>
            </button>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-300">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={switchToSignup}
              className="text-cyan-400 hover:text-yellow-400 font-medium transition-colors duration-200"
            >
              Sign up
            </button>
          </p>
        </div>
      </form>
    </Modal>
  )
}