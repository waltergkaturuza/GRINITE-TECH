# Backend Deployment Guideline

Complete guide to deploy the NestJS backend to Vercel. Use this after the frontend is already running.

---

## Prerequisites

- [ ] Neon database created and running
- [ ] Vercel account
- [ ] Code in a Git repo (GitHub, GitLab, Bitbucket)

---

## Step 1: Get Neon Database URL

1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Copy the connection string (Connection String or `DATABASE_URL`)
4. Format: `postgresql://user:password@host/database?sslmode=require`

---

## Step 2: Create Backend Project on Vercel

### Option A: Vercel Dashboard

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your repository
3. Set **Root Directory** → `granite-tech-system/backend`
4. Framework Preset → **Other**
5. Build Command → `npm run build` (optional)
6. Output Directory → leave default
7. Do **not** deploy yet — add environment variables first

### Option B: Vercel CLI

```bash
cd granite-tech-system/backend
vercel
# Follow prompts, set root to granite-tech-system/backend
```

---

## Step 3: Add Environment Variables

In Vercel: **Project → Settings → Environment Variables**

### Required

| Variable       | Value                    | Environment |
|----------------|--------------------------|-------------|
| `DATABASE_URL` | Your Neon connection string | Production  |
| `JWT_SECRET`   | Random secret (e.g. 32+ chars) | Production  |

### Recommended (for frontend to work)

| Variable       | Value                          | Environment |
|----------------|--------------------------------|-------------|
| `FRONTEND_URL` | Your frontend URL (e.g. `https://granite-tech-frontend.vercel.app`) | Production  |

### Optional

| Variable | Description |
|----------|-------------|
| `ALLOWED_ORIGINS` | Comma-separated CORS origins, e.g. `https://app.example.com,https://example.com` |
| `JWT_EXPIRATION` | JWT expiry, default `24h` |
| `STRIPE_SECRET_KEY` | For Stripe payments |
| `STRIPE_WEBHOOK_SECRET` | For Stripe webhooks |
| `GMAIL_USER` | Gmail address for email |
| `GMAIL_APP_PASSWORD` | Gmail app password for email |

---

## Step 4: Deploy

1. In Vercel, click **Deploy**
2. Or via CLI: `vercel --prod`

Wait for the build to finish.

---

## Step 5: Get Backend URL

After deployment, note your backend URL, e.g.:
- `https://granite-tech-backend-xxx.vercel.app`

---

## Step 6: Point Frontend to Backend

Update the frontend environment variables in Vercel (frontend project) → Settings → Environment Variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.vercel.app/api/v1` |

Include `/api/v1` — the frontend expects the full API base URL.

Redeploy the frontend after changing env vars.

---

## API Endpoints (after deployment)

| Purpose | URL |
|---------|-----|
| API base | `https://your-backend.vercel.app/api/v1` |
| Swagger docs | `https://your-backend.vercel.app/api/docs` |
| Health check | `https://your-backend.vercel.app/api/v1/health` |

---

## CORS

The backend already allows these origins by default:

- `https://granite-tech-frontend.vercel.app`
- `https://grinite-tech-frontend.vercel.app`
- `https://quantistechnologies.co.zw`
- `https://www.quantistechnologies.co.zw`
- Any URL set in `FRONTEND_URL` or `ALLOWED_ORIGINS`

Add more in `ALLOWED_ORIGINS` if needed (comma-separated).

---

## Troubleshooting

### Build fails

- Check Node.js version (Vercel uses 18.x by default)
- Set `NODE_VERSION` in env if needed

### 500 errors / Database connection fails

- Confirm `DATABASE_URL` is correct and uses `?sslmode=require`
- Ensure Neon project is active (no pause)
- Test the connection string locally

### CORS errors in frontend

- Add your frontend URL to `FRONTEND_URL` or `ALLOWED_ORIGINS`
- Redeploy backend after changing env vars

### Cold starts

- First request after inactivity may take a few seconds
- Consider Vercel Pro for better limits

---

## Summary Checklist

1. [ ] Neon database URL copied
2. [ ] Vercel project created, root = `granite-tech-system/backend`
3. [ ] `DATABASE_URL` and `JWT_SECRET` added
4. [ ] `FRONTEND_URL` added (your live frontend URL)
5. [ ] Deployed successfully
6. [ ] Frontend env updated with backend URL
7. [ ] Frontend redeployed
