'use client'

import Link from 'next/link'
import SiteFooter from '@/components/SiteFooter'

export default function SignupPage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-granite-800 via-jungle-900 to-crimson-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-900 to-peach-900">
                QUANTIS TECHNOLOGIES
              </h1>
            </Link>
            <p className="mt-2 text-gray-300">Clients do not need an account</p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-lg shadow-2xl p-8 border border-white/20 space-y-6">
            <p className="text-gray-200 leading-relaxed">
              We add you as the contact person for your project, invoices, quotations, and receipts.
              There is no client login.
            </p>
            <p className="text-gray-400 text-sm">
              Tell us about your work and we will follow up. Staff and developers sign in from the
              login page.
            </p>
            <Link
              href="/contact"
              className="block w-full text-center bg-gradient-to-r from-jungle-900 to-olive-900 hover:from-jungle-800 hover:to-olive-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200"
            >
              Contact Quantis
            </Link>
            <p className="text-center text-gray-300 text-sm">
              Staff or developer?{' '}
              <Link
                href="/login"
                className="text-yellow-900 hover:text-peach-900 font-medium transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
      <SiteFooter />
    </>
  )
}
