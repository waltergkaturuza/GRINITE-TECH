

# Deploy Backend to Vercel

The backend is configured for Vercel serverless deployment with the full NestJS API.

## Deploy via Vercel CLI

1. **From the backend directory:**
   ```bash
   cd granite-tech-system/backend
   vercel
   ```

2. **Or link an existing project:**
   ```bash
   vercel link
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   # ... add other env vars
   vercel --prod
   ```

## Deploy via Vercel Dashboard

1. Import the repo and set **Root Directory** to `granite-tech-system/backend`
2. Framework preset: **Other** (no framework)
3. Build command: `npm run build` (optional, Nest build for validation)
4. Output directory: leave default

## Required Environment Variables

Add these in Vercel → Project Settings → Environment Variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Neon, Supabase, Vercel Postgres) |
| `JWT_SECRET` | Secret for JWT token signing |
| `NODE_ENV` | Set to `production` (Vercel sets this automatically) |

### Optional

| Variable | Description |
|----------|-------------|
| `FRONTEND_URL` | Frontend URL for CORS (e.g. `https://your-frontend.vercel.app`) |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed CORS origins |
| `JWT_EXPIRATION` | JWT expiry (default: `24h`) |
| `STRIPE_SECRET_KEY` | For Stripe payments |
| `STRIPE_WEBHOOK_SECRET` | For Stripe webhooks |
| `GMAIL_USER`, `GMAIL_APP_PASSWORD` | For email |

## Database (PostgreSQL)

Use a serverless-friendly PostgreSQL provider:

- **[Neon](https://neon.tech)** – serverless Postgres with connection pooling
- **[Supabase](https://supabase.com)** – PostgreSQL + auth
- **[Vercel Postgres](https://vercel.com/storage/postgres)** – native Vercel integration

Example `DATABASE_URL` format:
```
postgresql://user:password@host:port/database?sslmode=require
```
