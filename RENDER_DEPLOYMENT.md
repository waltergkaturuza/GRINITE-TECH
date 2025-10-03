# Render.com Deployment Configuration

## Environment Variables for Render.com

### Backend Service Environment Variables
```bash
# Database (Render.com will provide DATABASE_URL automatically)
DATABASE_URL=postgresql://username:password@hostname:port/database
NODE_ENV=production
PORT=3001

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Stripe Configuration
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Email Configuration (using SendGrid or similar)
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
FROM_EMAIL=noreply@granite-tech.com

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DEST=./uploads

# Redis (if using Redis Cloud addon)
REDIS_URL=redis://username:password@hostname:port

# Frontend URL
FRONTEND_URL=https://your-frontend-domain.onrender.com

# API Rate Limiting
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100
```

### Frontend Environment Variables
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://your-backend-service.onrender.com
NEXT_PUBLIC_APP_URL=https://your-frontend-domain.onrender.com

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Analytics (if using)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

## Render.com Service Configuration

### Backend Service (render.yaml)
```yaml
services:
  - type: web
    name: granite-tech-backend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start:prod
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: granite-tech-db
          property: connectionString
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
```

### Frontend Service
```yaml
  - type: web
    name: granite-tech-frontend
    env: node
    buildCommand: npm install && npm run build
    startCommand: npm run start
    envVars:
      - key: NEXT_PUBLIC_API_URL
        value: https://granite-tech-backend.onrender.com
```

### Database
```yaml
databases:
  - name: granite-tech-db
    databaseName: granite_tech
    user: granite_user
```

## Deployment Steps

1. **Create Render.com Account**
   - Sign up at render.com
   - Connect your GitHub repository

2. **Create PostgreSQL Database**
   - Go to Render Dashboard
   - Create New → PostgreSQL
   - Name: `granite-tech-db`
   - Copy the DATABASE_URL for environment variables

3. **Deploy Backend Service**
   - Create New → Web Service
   - Connect your GitHub repo
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start:prod`
   - Add environment variables

4. **Deploy Frontend Service**
   - Create New → Web Service
   - Connect same GitHub repo
   - Root Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm run start`
   - Add environment variables

5. **Configure Domain (Optional)**
   - Add custom domain in Render dashboard
   - Update CORS settings in backend
   - Update environment variables

## Database Initialization

Run the following SQL commands in your Render PostgreSQL database:

1. Connect to your database using the connection string
2. Run the schema.sql file to create tables
3. Run the sample-data.sql file to insert initial data

## Health Checks

Render.com automatically handles health checks, but you can customize:

```javascript
// In your main.ts or app.ts
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

## Monitoring

- Use Render's built-in logs and metrics
- Consider adding external monitoring like Sentry
- Set up alerts for downtime or errors