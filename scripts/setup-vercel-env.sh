#!/bin/bash

# Vercel Environment Variables Setup Script
# Run this to set up environment variables for the backend deployment

echo "Setting up Vercel environment variables..."

# Your Neon database connection string
DATABASE_URL="postgresql://neondb_owner:npg_BSxyR0PiM9Fd@ep-holy-frog-ade6mw5t-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Generate a random JWT secret (you can also use your own)
JWT_SECRET="GraniteTech_JWT_Super_Secret_Key_2024_Production"

echo "Database URL: $DATABASE_URL"
echo "JWT Secret: $JWT_SECRET"

echo ""
echo "NEXT STEPS:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Click on your 'grinite-tech-backend' project"
echo "3. Go to Settings → Environment Variables"
echo "4. Add these variables:"
echo ""
echo "NODE_ENV = production"
echo "DATABASE_URL = $DATABASE_URL"
echo "JWT_SECRET = $JWT_SECRET"
echo "JWT_EXPIRATION = 24h"
echo "CORS_ORIGIN = https://grinite-tech-frontend.vercel.app"
echo ""
echo "5. Click 'Save' for each variable"
echo "6. Go to Deployments tab and redeploy the latest deployment"
echo ""
echo "After setting these variables, your authentication should work!"