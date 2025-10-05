// Centralized CORS configuration logic
// Parses allowed origins from environment and exports helper utilities

const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'https://grinite-tech-frontend.vercel.app',
  'https://granite-tech-frontend.vercel.app',
  process.env.FRONTEND_URL,
  process.env.NEXT_PUBLIC_SITE_URL
].filter(Boolean) as string[];

// Comma separated list in env var ALLOWED_ORIGINS overrides / extends defaults
function parseEnvOrigins(): string[] {
  const raw = process.env.ALLOWED_ORIGINS; // e.g. "https://a.com,https://b.com"
  if (!raw) return [];
  return raw.split(',').map(o => o.trim()).filter(Boolean);
}

export const allowedOrigins: string[] = Array.from(new Set([...DEFAULT_ORIGINS, ...parseEnvOrigins()]));

// Determines if an origin is permitted. If no Origin header (same-origin / curl), allow.
export function isOriginAllowed(origin?: string): boolean {
  if (!origin) return true; // Non-browser or same-origin
  if (allowedOrigins.includes('*')) return true; // Explicit wildcard via env if really needed
  return allowedOrigins.includes(origin);
}

// Utility to get value for Access-Control-Allow-Origin header
export function resolveAllowOrigin(origin?: string): string | undefined {
  if (!origin) return origin; // Let framework potentially omit for same-origin
  return isOriginAllowed(origin) ? origin : undefined; // Return undefined to intentionally omit header
}

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (e.g., mobile apps, Postman, server-to-server)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowlist
    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }
    
    // Log rejected origins in development
    if (process.env.NODE_ENV !== 'production') {
      console.log('[CORS] Rejected origin:', origin);
      console.log('[CORS] Allowed origins:', allowedOrigins);
    }
    
    // Reject with false instead of Error to allow proper CORS headers
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With', 'Origin'],
  optionsSuccessStatus: 200, // Changed from 204 to 200 for better compatibility
  preflightContinue: false,
};

export function logCorsDebug(origin?: string) {
  // eslint-disable-next-line no-console
  console.log('[CORS Config]', { 
    origin, 
    allowed: isOriginAllowed(origin), 
    allowedOrigins,
    env: process.env.NODE_ENV,
    frontendUrl: process.env.FRONTEND_URL,
    allowedOriginsEnv: process.env.ALLOWED_ORIGINS
  });
}
