/**
 * 🔐 CORS & Security Headers Configuration
 * تكوين آمن للـ CORS والـ headers
 */

// قائمة الـ origins المسموحة
const allowedOrigins = [
  // Production
  'https://merasapp.com',
  'https://www.merasapp.com',
  'https://admin.merasapp.com',
  'https://app.merasapp.com',
  
  // Staging
  'https://staging.merasapp.com',
  
  // Development
  ...(process.env.NODE_ENV === 'development' 
    ? [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://127.0.0.1:3000',
      ] 
    : []),
];

/**
 * التحقق من أن الـ origin مسموح به
 */
export function isOriginAllowed(origin: string | null | undefined): boolean {
  if (!origin) return false;
  return allowedOrigins.includes(origin);
}

/**
 * الحصول على CORS headers الآمنة
 */
export function getCorsHeaders(origin: string | null | undefined) {
  const headers = new Headers();

  if (origin && isOriginAllowed(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
    headers.set('Access-Control-Allow-Credentials', 'true');
    headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  }

  // Security headers (هذه تُطبّق على جميع الـ responses)
  headers.set('X-Content-Type-Options', 'nosniff');
  headers.set('X-Frame-Options', 'DENY');
  headers.set('X-XSS-Protection', '1; mode=block');
  headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

  return headers;
}

/**
 * معالج OPTIONS request (CORS preflight)
 */
export async function handleCorsPreFlight(
  request: Request
): Promise<Response> {
  const origin = request.headers.get('origin');

  if (!isOriginAllowed(origin)) {
    return new Response('CORS not allowed', { status: 403 });
  }

  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

/**
 * مثال الاستخدام في API route:
 * 
 * import { isOriginAllowed, getCorsHeaders, handleCorsPreFlight } from '@/lib/cors';
 * 
 * export async function POST(request: Request) {
 *   const origin = request.headers.get('origin');
 *   
 *   // معالجة CORS preflight
 *   if (request.method === 'OPTIONS') {
 *     return handleCorsPreFlight(request);
 *   }
 *   
 *   // التحقق من الـ origin
 *   if (!isOriginAllowed(origin)) {
 *     return new Response('CORS not allowed', { status: 403 });
 *   }
 *   
 *   // معالجة الـ request
 *   const response = new Response(JSON.stringify({ success: true }));
 *   const corsHeaders = getCorsHeaders(origin);
 *   corsHeaders.forEach((value, key) => response.headers.set(key, value));
 *   
 *   return response;
 * }
 */
