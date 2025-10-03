# GRANITE TECH - Vercel Deployment Configuration

## ✅ NEON DATABASE CONNECTED
# Use the pooled connection for better performance with Vercel
DATABASE_URL=postgresql://neondb_owner:npg_BSxyR0PiM9Fd@ep-holy-frog-ade6mw5t-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require

## 🚀 DEPLOYMENT STEPS

### 1. BACKEND DEPLOYMENT (Deploy first)
Go to vercel.com → Import → Select "backend" folder only
Add these environment variables:
```
DATABASE_URL=postgresql://neondb_owner:npg_BSxyR0PiM9Fd@ep-holy-frog-ade6mw5t-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require
JWT_SECRET=granite-tech-super-secret-jwt-key-2024-production-safe
NODE_ENV=production
```

### 2. FRONTEND DEPLOYMENT (Deploy after backend)
Import same repo → Select "frontend" folder only
Add these environment variables (update backend URL after deployment):
```
NEXT_PUBLIC_API_URL=https://[YOUR-BACKEND-URL].vercel.app/api/v1
NEXT_PUBLIC_SITE_URL=https://[YOUR-FRONTEND-URL].vercel.app
```

### 3. OPTIONAL: Stripe Integration
If you want payment processing, add:
```
# Backend
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key_here

# Frontend  
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_key_here
```

## 🎯 NEXT STEPS:
1. Deploy backend first at vercel.com
2. Copy backend URL 
3. Deploy frontend with backend URL
4. Test the application!