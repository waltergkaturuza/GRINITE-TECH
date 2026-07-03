# Vercel-only backend setup (no Render)

Use this when the API runs on **Vercel serverless** with Neon Postgres.

## Why timeouts happen

A **custom domain does not keep serverless functions warm**. What matters:

| Factor | Effect |
|--------|--------|
| Separate backend Vercel project | Only API traffic hits it → goes cold when idle |
| Full NestJS + TypeORM cold start | 30–90s first request |
| Frontend on `www.quantistechnologies.co.zw` | Gets constant traffic → stays warm |

Other Vercel apps feel “always up” because they are **Next.js full-stack** (pages + API in one project with steady traffic).

## Recommended setup (all Vercel)

### 1. Backend project (`grinite-tech-backend`)

- Root directory: `backend`
- Env: `DATABASE_URL`, `JWT_SECRET`, `NODE_ENV=production`
- Optional custom domain: **`api.quantistechnologies.co.zw`** → add in Vercel → Domains on the **backend** project

**Cron warming** (in `backend/vercel.json`): hits `/api/v1/health` every 5 minutes to reduce cold starts.

### 2. Frontend project (`quantistechnologies.co.zw`)

Set in Vercel → Environment Variables:

```
NEXT_PUBLIC_API_URL=https://www.quantistechnologies.co.zw/api/v1
BACKEND_PROXY_URL=https://grinite-tech-backend.vercel.app
```

Or if you use custom domain on backend:

```
NEXT_PUBLIC_API_URL=https://www.quantistechnologies.co.zw/api/v1
BACKEND_PROXY_URL=https://api.quantistechnologies.co.zw
```

**Same-origin proxy:** `next.config.js` rewrites `/api/v1/*` → your backend URL. The browser calls your main site; Next.js forwards to the Nest API. Blob uploads stay on `/api/upload` (frontend).

### 3. Backend CORS (already configured)

These origins are allowed in `backend/src/config/cors.config.ts`:

- `https://quantistechnologies.co.zw`
- `https://www.quantistechnologies.co.zw`

Set on backend Vercel:

```
FRONTEND_URL=https://www.quantistechnologies.co.zw
ALLOWED_ORIGINS=https://quantistechnologies.co.zw,https://www.quantistechnologies.co.zw
```

### 4. Verify

```bash
curl https://www.quantistechnologies.co.zw/api/v1/health
# Should return JSON with invoiceEntityRegistered, etc.

curl https://grinite-tech-backend.vercel.app/api/v1/health
# Direct backend (should match after deploy)
```

## Do NOT

- Expose `DATABASE_URL` to the frontend
- Rely on Render if the free tier is suspended
- Expect custom domain alone to fix cold starts without cron + proxy

## If still slow

1. Redeploy **both** projects after git push
2. Confirm cron is enabled (Vercel → backend → Cron Jobs)
3. First request after long idle may still take ~30s once; cron limits how often
4. Upgrade Vercel Pro for longer `maxDuration` and more cron flexibility
