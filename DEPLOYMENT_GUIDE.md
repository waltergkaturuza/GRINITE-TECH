# Quantis Technologies Render.com Deployment

## Quick Deployment Guide

### Prerequisites
1. GitHub repository with your code
2. Render.com account
3. Stripe account (for payments)

### Step 1: Create PostgreSQL Database
1. Log into Render.com Dashboard
2. Click "New" → "PostgreSQL"
3. Configure:
   - **Name**: `granite-tech-db`
   - **Database Name**: `granite_tech`
   - **User**: `granite_user`
   - **Region**: Choose closest to your users
   - **Plan**: Start with Free tier
4. Click "Create Database"
5. **Save the connection details** (you'll need the DATABASE_URL)

### Step 2: Deploy Backend Service
1. Click "New" → "Web Service"
2. Connect your GitHub repository
3. Configure:
   - **Name**: `granite-tech-backend`
   - **Environment**: `Node`
   - **Region**: Same as your database
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

4. **Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   DATABASE_URL: [Your PostgreSQL connection string from Step 1]
   NODE_ENV: production
   PORT: 10000
   JWT_SECRET: [Generate a strong secret key]
   JWT_EXPIRES_IN: 7d
   STRIPE_SECRET_KEY: [Your Stripe secret key]
   STRIPE_WEBHOOK_SECRET: [Your Stripe webhook secret]
   FRONTEND_URL: [Will be your frontend URL from Step 3]
   ```

5. Click "Create Web Service"

### Step 3: Deploy Frontend Service
1. Click "New" → "Web Service"
2. Connect same GitHub repository
3. Configure:
   - **Name**: `granite-tech-frontend`
   - **Environment**: `Node`
   - **Region**: Same as backend
   - **Branch**: `main`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start`

4. **Environment Variables**:
   ```
   NEXT_PUBLIC_API_URL: [Your backend URL from Step 2]
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: [Your Stripe publishable key]
   ```

5. Click "Create Web Service"

### Step 4: Initialize Database
1. Go to your backend service in Render dashboard
2. Open the "Shell" tab
3. Run the database setup script:
   ```bash
   chmod +x scripts/setup-render-db.sh
   ./scripts/setup-render-db.sh
   ```

### Step 5: Configure Stripe Webhooks
1. In your Stripe Dashboard, go to "Developers" → "Webhooks"
2. Click "Add endpoint"
3. URL: `https://your-backend-url.onrender.com/api/v1/payments/webhook`
4. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
5. Copy the webhook secret and add it to your backend environment variables

### Step 6: Update Environment Variables
After both services are deployed:
1. Update backend `FRONTEND_URL` with actual frontend URL
2. Update frontend `NEXT_PUBLIC_API_URL` with actual backend URL
3. Both services will automatically redeploy

### Step 7: Custom Domain (Optional)
1. In Render dashboard, go to your frontend service
2. Click "Settings" → "Custom Domains"
3. Add your domain (e.g., `granite-tech.com`)
4. Update DNS records as instructed
5. Update CORS settings in backend if needed

## Environment URLs
After deployment, your services will be available at:
- **Backend API**: `https://granite-tech-backend.onrender.com`
- **Frontend**: `https://granite-tech-frontend.onrender.com`
- **API Documentation**: `https://granite-tech-backend.onrender.com/api/docs`

## Important Notes
- **Cold Starts**: Free tier services sleep after 15 minutes of inactivity
- **Database**: Free PostgreSQL has 1GB storage limit
- **Logs**: Available in Render dashboard for debugging
- **Auto-Deploy**: Services redeploy automatically on git push

## Troubleshooting
- Check logs in Render dashboard if deployment fails
- Ensure all environment variables are set correctly
- Database connection issues: verify DATABASE_URL format
- CORS errors: check FRONTEND_URL and ALLOWED_ORIGINS settings

## Upgrading to Paid Plans
When ready for production:
- Upgrade to Starter plan ($7/month) to avoid cold starts
- Upgrade database plan for more storage and performance
- Consider Redis addon for session storage and caching