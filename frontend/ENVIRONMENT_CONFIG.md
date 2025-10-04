# Environment Configuration Guide

This project uses different environment configurations for different deployment stages.

## Environment Files

- `.env.local` - Currently active local development configuration
- `.env.development` - Template for development environment
- `.env.production` - Template for production environment (Vercel)
- `.env.example` - Example configuration file

## Production URLs (Vercel Deployment)

**Backend API:** https://granite-tech-backend.vercel.app/api/v1
**Frontend App:** https://granite-tech-frontend.vercel.app
**Socket.IO:** https://granite-tech-backend.vercel.app

## Local Development URLs

**Backend API:** http://localhost:3001/api/v1
**Frontend App:** http://localhost:3000
**Socket.IO:** http://localhost:3001

## Switching Between Environments

### For Local Development:
Copy `.env.development` to `.env.local`:
```bash
cp .env.development .env.local
```

### For Production Deployment:
Copy `.env.production` to `.env.local`:
```bash
cp .env.production .env.local
```

### For Vercel Deployment:
Vercel will automatically use `.env.production` or you can set environment variables directly in the Vercel dashboard.

## Notes

- `.env.local` is gitignored and contains your active configuration
- Always restart the development server after changing environment variables
- Environment variables starting with `NEXT_PUBLIC_` are exposed to the browser
- Production secrets should be set directly in Vercel dashboard, not in files