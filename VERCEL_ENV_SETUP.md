# Vercel Environment Variables Setup

The backend is failing because it's missing required environment variables in Vercel. Here are the steps to fix this:

## Required Environment Variables for Backend

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Find your `grinite-tech-backend` project
3. Go to Settings → Environment Variables
4. Add these variables:

### Essential Variables:
```
NODE_ENV=production
DATABASE_URL=postgresql://your-neon-connection-string
JWT_SECRET=your-super-secret-jwt-key-for-production
JWT_EXPIRATION=24h
CORS_ORIGIN=https://grinite-tech-frontend.vercel.app
```

### For Stripe (if using payments):
```
STRIPE_SECRET_KEY=sk_live_your_live_stripe_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
```

## Database Setup

If you don't have a Neon database yet:

1. Go to https://neon.tech
2. Create a new project
3. Copy the connection string
4. Use it as your DATABASE_URL

## Current Issue

The backend is returning 500 errors because:
- DATABASE_URL is not set in Vercel
- JWT_SECRET is missing
- Database connection is failing

## Next Steps

1. Set up environment variables in Vercel
2. Redeploy the backend
3. Test authentication again