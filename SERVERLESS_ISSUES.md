# Vercel Serverless Deployment Issues & Solutions

## Problem: FUNCTION_INVOCATION_FAILED

### Root Cause
The NestJS application with TypeORM database initialization is too heavy for Vercel serverless cold starts:

1. **TypeORM Connection**: Establishing database connections during cold start adds 5-10 seconds
2. **Schema Synchronization**: `synchronize: true` attempts to create/update schema on every cold start
3. **Module Initialization**: Loading all NestJS modules and dependencies exceeds serverless timeout
4. **Memory Usage**: Full application initialization may exceed serverless memory limits

### Current Status
- ✅ **CORS Configuration**: Fixed and working correctly
- ✅ **Serverless Function**: Running successfully with lightweight handler
- ❌ **Full API**: NestJS with database not compatible with Vercel serverless functions

## Solutions

### Option 1: Use Vercel's Serverless SQL (Recommended)
```bash
# Install Vercel Postgres
npm install @vercel/postgres

# Update database.module.ts to use connection pooling
```

**Pros:**
- Designed for serverless
- Built-in connection pooling
- Fast cold starts

**Cons:**
- Vercel-specific
- Migration needed from TypeORM

### Option 2: Deploy as Docker Container on Vercel
Convert the backend to run as a container instead of serverless functions:

```yaml
# vercel.json
{
  "builds": [
    {
      "src": "Dockerfile",
      "use": "@vercel/static"
    }
  ]
}
```

**Pros:**
- Keep existing NestJS/TypeORM code
- No cold starts
- Full control

**Cons:**
- More expensive
- Requires container build

### Option 3: Use External Hosting for Backend
Deploy backend separately on:
- **Railway**: https://railway.app (Easy NestJS deployment)
- **Render**: https://render.com (Free tier available)
- **Fly.io**: https://fly.io (Global edge deployment)
- **AWS Lambda** with RDS Proxy

### Option 4: Optimize Current Setup
1. **Lazy Load Database**: Only connect when needed
2. **Connection Pooling**: Use `pg-pool` or `@neondatabase/serverless`
3. **Disable Synchronize**: Set `synchronize: false` in production
4. **Reduce Modules**: Split into multiple functions

## Current Implementation

The current `backend/api/index.ts` provides:
- ✅ Proper CORS headers for all requests
- ✅ OPTIONS preflight handling
- ✅ Error handling with CORS headers
- ℹ️ Service information endpoint

To restore full API functionality, implement one of the solutions above.

## Testing CORS

```powershell
# Test OPTIONS preflight
curl -I -X OPTIONS https://grinite-tech-backend.vercel.app/api/v1/users `
  -H "Origin: https://grinite-tech-frontend.vercel.app"

# Expected: 200 OK with CORS headers

# Test GET request
curl https://grinite-tech-backend.vercel.app/api/v1/users `
  -H "Origin: https://grinite-tech-frontend.vercel.app"

# Expected: Service information with CORS headers
```

## Next Steps

1. **Immediate**: CORS is working, frontend can communicate with backend
2. **Short-term**: Choose deployment strategy (Option 1, 2, or 3)
3. **Implementation**: Follow chosen solution's setup guide
4. **Testing**: Verify all endpoints work correctly

## Related Files
- `backend/api/index.ts` - Serverless handler with CORS
- `backend/src/config/cors.config.ts` - Centralized CORS configuration
- `backend/vercel.json` - Vercel deployment configuration
- `backend/src/database/database.module.ts` - Database connection (needs optimization)
