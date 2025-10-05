# Deploy Backend to Render - Step by Step Guide

## Prerequisites
- GitHub account with GRINITE-TECH repository
- Neon database connection string (DATABASE_URL)

## Step 1: Sign Up / Log In to Render

1. Go to https://render.com
2. Click **"Get Started"** or **"Sign In"**
3. Choose **"Sign in with GitHub"**
4. Authorize Render to access your GitHub repositories

## Step 2: Create New Web Service

1. Click **"New +"** button (top right)
2. Select **"Web Service"**
3. Connect your repository:
   - Find and select **"waltergkaturuza/GRINITE-TECH"**
   - Click **"Connect"**

## Step 3: Configure the Service

Fill in these settings:

### Basic Settings
- **Name**: `grinite-tech-backend` (or any name you prefer)
- **Region**: Choose closest to you (e.g., Oregon, Frankfurt)
- **Branch**: `main`
- **Root Directory**: `backend` ⚠️ IMPORTANT!

### Build Settings
- **Runtime**: `Node`
- **Build Command**: 
  ```
  npm install --include=dev && npm run build
  ```
- **Start Command**: 
  ```
  npm run start:prod
  ```

### Plan
- **Instance Type**: Select **"Free"** (Free tier includes 750 hours/month)

## Step 4: Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"** and add these:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `PORT` | `3001` |
| `DATABASE_URL` | Your Neon connection string (postgres://...) |
| `JWT_SECRET` | Generate a random string (use: https://generate-secret.vercel.app/32) |
| `FRONTEND_URL` | `https://grinite-tech-frontend.vercel.app` |
| `ALLOWED_ORIGINS` | `https://grinite-tech-frontend.vercel.app,https://granite-tech-frontend.vercel.app` |

### How to Get Your Neon DATABASE_URL:
1. Go to https://console.neon.tech
2. Select your project
3. Click **"Connection string"**
4. Copy the connection string (looks like: `postgresql://username:password@host/database`)

## Step 5: Deploy!

1. Click **"Create Web Service"**
2. Render will:
   - Clone your repository
   - Install dependencies
   - Build your NestJS app
   - Start the server
   - This takes about 2-3 minutes

## Step 6: Wait for Deployment

Watch the logs in real-time:
- You'll see: Building... → Deploying... → Live ✅
- Look for: `Application is running on: http://0.0.0.0:3001`

## Step 7: Get Your Backend URL

Once deployed, you'll see:
```
Your service is live at https://grinite-tech-backend.onrender.com
```

Copy this URL!

## Step 8: Test Your Backend

Test the health endpoint:
```powershell
curl https://grinite-tech-backend.onrender.com/api/v1/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-10-05T...",
  "environment": "production",
  "hasDatabase": true,
  "hasJwtSecret": true
}
```

Test CORS:
```powershell
curl -I -X OPTIONS https://grinite-tech-backend.onrender.com/api/v1/users `
  -H "Origin: https://grinite-tech-frontend.vercel.app"
```

Should return `200 OK` with CORS headers.

## Step 9: Update Frontend API URL

Update your frontend to use the new backend URL:

```typescript
// frontend/src/lib/api.ts (or wherever your API base URL is)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
  'https://grinite-tech-backend.onrender.com';
```

Add to your Vercel environment variables:
1. Go to https://vercel.com/your-username/grinite-tech-frontend
2. Settings → Environment Variables
3. Add: `NEXT_PUBLIC_API_URL` = `https://grinite-tech-backend.onrender.com`
4. Redeploy frontend

## Step 10: Verify Everything Works

1. Visit your frontend: https://grinite-tech-frontend.vercel.app
2. Open browser DevTools (F12) → Network tab
3. Try to log in or fetch data
4. Check that API calls go to `grinite-tech-backend.onrender.com`
5. Verify no CORS errors ✅

## Troubleshooting

### Issue: "Application failed to respond"
- Check logs in Render dashboard
- Verify `DATABASE_URL` is correct
- Ensure port is set to `3001`

### Issue: CORS errors still appearing
- Verify `ALLOWED_ORIGINS` includes your frontend URL
- Check that both frontend and backend are using HTTPS
- Clear browser cache

### Issue: Database connection failed
- Verify Neon database is active
- Check connection string format
- Ensure Neon allows external connections

### Issue: Build failed
- Check Render logs for specific error
- Verify `backend/package.json` has `build` and `start:prod` scripts
- Ensure all dependencies are in `package.json`

## Free Tier Limitations

Render Free Tier includes:
- ✅ 750 hours/month (enough for 1 always-on service)
- ✅ Auto-deploys on git push
- ⚠️ Spins down after 15 min of inactivity (cold starts ~30 seconds)
- ⚠️ Limited to 512MB RAM

To avoid cold starts, upgrade to paid plan ($7/month) or use a cron job to ping your API every 14 minutes.

## Auto-Deploy on Git Push

Once set up, every time you push to `main`:
1. Render automatically detects the changes
2. Rebuilds and redeploys your backend
3. You'll get a notification when deployment completes

## Next Steps

- [ ] Deploy backend to Render
- [ ] Update frontend API URL
- [ ] Test all endpoints
- [ ] Monitor logs for any issues
- [ ] Consider upgrading to paid plan to avoid cold starts

---

**Need Help?**
- Render Docs: https://render.com/docs
- Check build logs in Render dashboard
- Review backend logs for errors
