# Frontend Environment Variables Setup

The frontend is failing because environment variables are not properly configured in Vercel.

## Required Frontend Environment Variables

Go to Vercel Dashboard → `grinite-tech-frontend` project → Settings → Environment Variables

Add these variables:

```
NEXT_PUBLIC_API_URL=https://grinite-tech-backend.vercel.app/api/v1
NEXT_PUBLIC_APP_URL=https://grinite-tech-frontend.vercel.app
NEXT_PUBLIC_APP_NAME=Quantis Technologies
NEXT_PUBLIC_APP_VERSION=1.0.0
NODE_ENV=production
```

## Important Notes

1. All variables that need to be accessible in the browser must start with `NEXT_PUBLIC_`
2. After adding environment variables, redeploy the frontend project
3. The API URL must include the full path including `/api/v1`

## Test URLs

- Frontend Debug Page: https://grinite-tech-frontend.vercel.app/debug
- Backend Health Check: https://grinite-tech-backend.vercel.app/api/v1/health

## Common Issues

1. **Login/Register Fails**: Usually means `NEXT_PUBLIC_API_URL` is not set
2. **CORS Errors**: Backend and frontend URLs must match in CORS configuration
3. **404 Errors**: Wrong API path (missing `/api/v1`)

## Testing

After setting environment variables:
1. Go to the debug page to verify configuration
2. Test login with: admin@granitetech.com / GraniteTech2024!
3. Test registration with new user details