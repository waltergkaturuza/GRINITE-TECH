import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import ChatbotWrapper from './components/chatbot/ChatbotWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Quantis Technologies - Comprehensive Business Solutions',
  description: 'Professional web development, digital products, and business automation solutions.',
  keywords: 'web development, digital products, business automation, Quantis Technologies',
  authors: [{ name: 'Quantis Technologies Team' }],
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {children}
          {/* AI Chatbot - Available globally across all pages */}
          <ChatbotWrapper />
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}