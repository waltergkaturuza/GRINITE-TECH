/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost', 'granitetech.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.granitetech.com',
      },
    ],
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },
}

module.exports = nextConfig