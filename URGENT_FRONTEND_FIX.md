# URGENT: Frontend Environment Variables Missing

## The Problem
Your frontend on Vercel is not making API calls because `NEXT_PUBLIC_API_URL` is not configured in Vercel.

## Quick Fix Steps

1. **Go to Vercel Dashboard**:
   - Visit https://vercel.com/dashboard
   - Click on your `grinite-tech-frontend` project

2. **Add Environment Variables**:
   - Go to Settings → Environment Variables
   - Click "Add New" and add:

```
Name: NEXT_PUBLIC_API_URL
Value: https://grinite-tech-backend.vercel.app/api/v1
Environment: Production
```

3. **Redeploy**:
   - Go to Deployments tab
   - Click "..." on the latest deployment
   - Click "Redeploy"

## Why This Happens
- Next.js only includes environment variables that start with `NEXT_PUBLIC_` in the browser
- Without this variable, the frontend defaults to `localhost:3001`
- This is why you see no API calls in the network tab

## After Setting Environment Variables
You should see API calls like:
```
POST https://grinite-tech-backend.vercel.app/api/v1/auth/login
POST https://grinite-tech-backend.vercel.app/api/v1/auth/register
```

## Test After Fix
1. Open browser dev tools → Network tab
2. Try logging in with: admin@granitetech.com / GraniteTech2024!
3. You should see the API call appear in the network tab