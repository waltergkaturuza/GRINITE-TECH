import { corsOptions, resolveAllowOrigin } from '../src/config/cors.config';

export default async function handler(req: any, res: any) {
  // Log everything for debugging
  console.log('=== VERCEL FUNCTION STARTED ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Origin:', req.headers.origin);
  
  try {
    // Get origin
    const origin = req.headers.origin as string | undefined;
    const allowOrigin = resolveAllowOrigin(origin);
    
    console.log('Resolved origin:', allowOrigin);
    
    // Set CORS headers
    if (allowOrigin) {
      res.setHeader('Access-Control-Allow-Origin', allowOrigin);
    }
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,Accept,X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Vary', 'Origin');
    
    // Handle OPTIONS
    if (req.method === 'OPTIONS') {
      console.log('Returning 200 for OPTIONS');
      return res.status(200).end();
    }
    
    // For now, return a simple response to test if function works
    console.log('Returning test response');
    return res.status(200).json({
      message: 'Backend is running',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url
    });
    
  } catch (error: any) {
    console.error('ERROR:', error);
    console.error('Stack:', error?.stack);
    
    return res.status(500).json({
      error: 'Function failed',
      message: error?.message || String(error),
      stack: error?.stack
    });
  }
}
