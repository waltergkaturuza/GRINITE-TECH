import type { Request } from 'express';

const cache = new Map<string, string | null>();
const CACHE_LIMIT = 500;

function headerValue(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  return (raw || '').split(',')[0].trim();
}

function isPublicIp(ip: string) {
  if (!ip || ip === '::1' || ip === '127.0.0.1') return false;
  if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('169.254.')) return false;
  const v4 = ip.match(/^172\.(\d+)\./);
  if (v4) {
    const second = Number(v4[1]);
    if (second >= 16 && second <= 31) return false;
  }
  if (ip.toLowerCase().startsWith('fc') || ip.toLowerCase().startsWith('fd') || ip.toLowerCase().startsWith('fe80')) {
    return false;
  }
  return true;
}

export function countryCodeFromHeaders(headers: Request['headers']) {
  const raw = headerValue(headers['x-vercel-ip-country'] || headers['cf-ipcountry']).toUpperCase();
  if (!/^[A-Z]{2}$/.test(raw) || raw === 'XX' || raw === 'T1') return null;
  return raw;
}

export function clientIpFromRequest(req: Request) {
  const forwarded = headerValue(req.headers['x-forwarded-for']);
  const realIp = headerValue(req.headers['x-real-ip']);
  const ip = (forwarded || realIp || req.ip || '').replace(/^::ffff:/, '');
  return isPublicIp(ip) ? ip : null;
}

export function countryName(code: string) {
  try {
    return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) || code;
  } catch {
    return code;
  }
}

async function lookupCountryCode(ip: string) {
  if (cache.has(ip)) return cache.get(ip) ?? null;
  let code: string | null = null;
  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      signal: AbortSignal.timeout(1500),
    });
    if (response.ok) {
      const body = (await response.json()) as { success?: boolean; country_code?: string };
      const next = (body.country_code || '').toUpperCase();
      if (body.success && /^[A-Z]{2}$/.test(next)) code = next;
    }
  } catch {
    code = null;
  }
  if (cache.size >= CACHE_LIMIT) {
    const oldest = cache.keys().next().value;
    if (oldest) cache.delete(oldest);
  }
  cache.set(ip, code);
  return code;
}

export async function countryCodeForRequest(req: Request) {
  const fromHeader = countryCodeFromHeaders(req.headers);
  if (fromHeader) return fromHeader;
  const ip = clientIpFromRequest(req);
  if (!ip) return null;
  return lookupCountryCode(ip);
}
