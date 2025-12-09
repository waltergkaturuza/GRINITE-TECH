import { corsOptions, resolveAllowOrigin } from '../src/config/cors.config';

/**
 * Lightweight Vercel serverless handler with CORS support
 * 
 * NOTE: Full NestJS initialization with TypeORM is too heavy for serverless cold starts.
 * This handler provides proper CORS for all requests and returns appropriate messages.
 * 
 * For production, consider:
 * 1. Moving to Vercel Edge Functions (lighter)
 * 2. Using connection pooling (e.g., @neondatabase/serverless)
 * 3. Deploying as a container instead of serverless functions
 */
export default async function handler(req: any, res: any) {
  try {
    // Get origin for CORS
    const origin = req.headers.origin as string | undefined;
    const allowOrigin = resolveAllowOrigin(origin);
    
    // Set CORS headers
    if (allowOrigin) {
      res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Vary', 'Origin');
    
    // Handle OPTIONS preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    // Return service information
    return res.status(200).json({
      message: 'Quantis Technologies API',
      version: '1.0.0',
      status: 'operational',
      note: 'Full API functionality requires database configuration. Please see deployment documentation.',
      timestamp: new Date().toISOString(),
      request: {
        method: req.method,
        url: req.url,
      },
    });
    
  } catch (error: any) {
    console.error('[Error]:', error);
    
    // Ensure CORS headers on error
    const origin = req.headers.origin as string | undefined;
    const allowOrigin = resolveAllowOrigin(origin);
    if (allowOrigin) {
      res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    return res.status(500).json({
      error: 'Internal Server Error',
      message: error?.message || String(error),
    });
  }
}
