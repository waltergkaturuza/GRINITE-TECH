# Connect Frontend to Render Backend - Quick Guide

## ✅ Backend is Live!

Your backend is now running at: **`https://grinite-tech.onrender.com`**

## Step 1: Add Environment Variable to Vercel Frontend

1. Go to https://vercel.com
2. Select your **grinite-tech-frontend** project
3. Go to **Settings** → **Environment Variables**
4. Click **Add New**
5. Add this variable:

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | `https://grinite-tech.onrender.com/api/v1` |

6. Select **All Environments** (Production, Preview, Development)
7. Click **Save**

## Step 2: Redeploy Frontend

After adding the environment variable:

1. Go to **Deployments** tab
2. Click on the latest deployment
3. Click **⋮** (three dots) → **Redeploy**
4. Confirm redeploy

**OR** push any change to trigger auto-deploy:

```powershell
git commit --allow-empty -m "Update to use Render backend"
git push origin main
```

## Step 3: Test the Connection

Once redeployed:

1. Visit https://grinite-tech-frontend.vercel.app
2. Open DevTools (F12) → **Network** tab
3. Try any action (login, view products, etc.)
4. Check that API calls go to `grinite-tech.onrender.com` ✅
5. Verify **no CORS errors** in console ✅

## Quick Test from Terminal

Test the backend directly:

```powershell
# Test health endpoint
curl https://grinite-tech.onrender.com/api/v1/health

# Test CORS
curl -I -X OPTIONS https://grinite-tech.onrender.com/api/v1/users `
  -H "Origin: https://grinite-tech-frontend.vercel.app"
```

Expected: Both should return successful responses with CORS headers.

## Architecture Overview

```
Frontend (Vercel)                    Backend (Render)
https://grinite-tech-                https://grinite-tech.onrender.com
frontend.vercel.app                  
     │                                    ↑
     └────── API Calls ─────────────────┘
             /api/v1/*
```

## Your Full Stack URLs

- **Frontend**: https://grinite-tech-frontend.vercel.app
- **Backend**: https://grinite-tech.onrender.com
- **Backend API**: https://grinite-tech.onrender.com/api/v1
- **Health Check**: https://grinite-tech.onrender.com/api/v1/health
- **API Docs**: https://grinite-tech.onrender.com/api/docs

## Important Notes

### ⚠️ Render Free Tier Cold Starts
- Render free tier spins down after 15 minutes of inactivity
- First request after inactivity takes ~30 seconds (cold start)
- Subsequent requests are instant
- **Solution**: Upgrade to $7/month plan OR use cron job to keep alive

### Keep-Alive Service (Optional)

To prevent cold starts, you can use a free service like **cron-job.org**:

1. Go to https://cron-job.org
2. Create account
3. Add new cron job:
   - URL: `https://grinite-tech.onrender.com/api/v1/health`
   - Interval: Every 14 minutes
   - This keeps your backend warm!

## What's Working Now

✅ CORS configured correctly  
✅ Backend deployed and running  
✅ Database connected (Neon PostgreSQL)  
✅ All API endpoints available  
✅ Auto-deploy on git push (backend)  
✅ Auto-deploy on git push (frontend)  

## Next: Update Frontend

Add the environment variable to Vercel, redeploy, and you're done! 🎉

---

**Having Issues?**
- Check Vercel build logs
- Check Render runtime logs
- Verify environment variables are set correctly
- Test backend directly with curl first
