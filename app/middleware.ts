import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { isOriginAllowed, getCorsHeaders, handleCorsPreFlight } from '@/lib/cors';
import { ipProtection } from '@/lib/security/ip-protection';

export async function middleware(request: NextRequest) {
  // 🔐 معالجة CORS preflight requests
  if (request.method === 'OPTIONS') {
    return handleCorsPreFlight(request);
  }

  // 🛡️ IP Protection - فحص الحظر
  const forwarded = request.headers.get('x-forwarded-for');
  const clientIP = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';

  if (ipProtection.isBlocked(clientIP)) {
    const retryAfter = ipProtection.getBlockTimeRemaining(clientIP);
    return new NextResponse(
      JSON.stringify({
        error: 'تم حظر عنوان IP مؤقتاً بسبب نشاط مشبوه',
        retryAfter,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': retryAfter.toString(),
        },
      }
    );
  }

  // 🔐 التحقق من الـ origin للـ API requests
  const origin = request.headers.get('origin');
  if (origin && request.nextUrl.pathname.startsWith('/api/')) {
    if (!isOriginAllowed(origin)) {
      ipProtection.recordViolation(clientIP);
      return new NextResponse('CORS not allowed', { status: 403 });
    }
  }

  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // ✅ حماية Dashboard
  if (request.nextUrl.pathname.startsWith('/dashboard') && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // ✅ فرض تأكيد الإيميل (المستخدم مسجل لكن لم يؤكد إيميله)
  if (request.nextUrl.pathname.startsWith('/dashboard') && user && !user.email_confirmed_at) {
    const verifyUrl = request.nextUrl.clone();
    verifyUrl.pathname = '/auth/verify';
    verifyUrl.searchParams.set('email', user.email || '');
    return NextResponse.redirect(verifyUrl);
  }

  // ✅ حماية API Routes الحساسة
  const protectedApiRoutes = [
    '/api/templates',
    '/api/ai/generate-text',
    '/api/ai/generate-image',
    '/api/ai/text-variations',
  ];

  const isProtectedApi = protectedApiRoutes.some(route =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedApi && !user) {
    // تسجيل محاولة وصول غير مصرح بها
    ipProtection.recordViolation(clientIP);
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  // ✅ منع المستخدمين المسجلين من الوصول لـ /login
  if (request.nextUrl.pathname === '/login' && user) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = '/dashboard';
    return NextResponse.redirect(dashboardUrl);
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
