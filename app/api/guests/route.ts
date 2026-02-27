import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/app/utils/supabase/server';
import { checkGuestsLimit, incrementGuestsUsed, decrementGuestsUsed } from '@/app/utils/check-limits-v2';
import { handleApiError } from '@/app/utils/api-error-handler';
import { auditLogger } from '@/lib/audit-logger';
import { metricsCollector } from '@/lib/metrics';
import { getCorsHeaders, isOriginAllowed } from '@/lib/cors';

// Helper to get client IP
function getClientIP(request: Request | NextRequest): string {
  const headersList = request.headers;
  return (headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '0.0.0.0').split(',')[0].trim();
}

// Helper to get user agent
function getUserAgent(request: Request | NextRequest): string {
  return request.headers.get('user-agent') || 'Unknown';
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIP(request);
  const userAgent = getUserAgent(request);
  const origin = request.headers.get('origin');

  try {
    // ✅ CORS Check
    if (origin && !isOriginAllowed(origin)) {
      await auditLogger.logSuspicious('add_guest', {
        ipAddress: ip,
        userAgent,
        reason: 'CORS origin not allowed',
        origin,
      });
      return new NextResponse('CORS not allowed', { status: 403 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      await auditLogger.logFailure('add_guest', 'Unauthorized access attempt', {
        ipAddress: ip,
        userAgent,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getCorsHeaders(origin || '') });
    }

    // ✅ التحقق من الحدود
    const limitCheck = await checkGuestsLimit(user.id);
    
    if (!limitCheck.allowed) {
      await auditLogger.logFailure('add_guest', 'Guests limit exceeded', {
        userId: user.id,
        ipAddress: ip,
        userAgent,
      });
      return NextResponse.json(
        { 
          error: limitCheck.message,
          upgrade_required: true,
          current_usage: limitCheck.limit - limitCheck.remaining,
          limit: limitCheck.limit
        },
        { status: 403, headers: getCorsHeaders(origin ?? undefined) }
      );
    }

    // جلب البيانات من Request
    const body = await request.json();
    const { name, email, phone, event_id, status = 'pending' } = body;

    // Validation
    if (!name || !event_id) {
      await auditLogger.logFailure('add_guest', 'Missing required fields: name or event_id', {
        userId: user.id,
        eventId: event_id,
        ipAddress: ip,
        userAgent,
      });
      return NextResponse.json(
        { error: 'الاسم ومعرف الحدث مطلوبان' },
        { status: 400, headers: getCorsHeaders(origin || "") }
      );
    }

    // إضافة الضيف
    const { data, error } = await supabase
      .from('attendees')
      .insert([{
        name,
        email,
        phone,
        event_id,
        status
      }])
      .select()
      .single();

    if (error) throw error;

    // ✅ زيادة العداد فقط إذا نجحت الإضافة
    if (data) {
      await incrementGuestsUsed(user.id);

      // 📝 Log success
      await auditLogger.logSuccess('add_guest', {
        userId: user.id,
        eventId: event_id,
        guestId: data.id,
        details: { guestEmail: email },
        ipAddress: ip,
        userAgent,
      });

      // 📊 Track metrics
      metricsCollector.incrementCounter('api_guests_created', 1, { userId: user.id });
    }

    // 📊 Track request duration
    const duration = Date.now() - startTime;
    metricsCollector.recordHistogram('api_request_duration_ms', duration, { route: '/api/guests', method: 'POST' });

    return NextResponse.json(
      { 
        success: true,
        data,
        remaining: limitCheck.remaining - 1
      },
      { headers: getCorsHeaders(origin || "") }
    );

  } catch (error) {
    // 📝 Log error
    await auditLogger.logFailure('add_guest', error instanceof Error ? error.message : 'Unknown error', {
      ipAddress: ip,
      userAgent,
    });

    // 📊 Track error
    metricsCollector.incrementCounter('api_errors', 1, { route: '/api/guests', method: 'POST' });

    return handleApiError(error, 'guests_post');
  }
}

// ✅ DELETE - مع تقليل العداد
export async function DELETE(request: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIP(request);
  const userAgent = getUserAgent(request);
  const origin = request.headers.get('origin');

  try {
    // ✅ CORS Check
    if (origin && !isOriginAllowed(origin)) {
      await auditLogger.logSuspicious('delete_guest', {
        ipAddress: ip,
        userAgent,
        reason: 'CORS origin not allowed',
      });
      return new NextResponse('CORS not allowed', { status: 403 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      await auditLogger.logFailure('delete_guest', 'Unauthorized access attempt', {
        ipAddress: ip,
        userAgent,
      });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getCorsHeaders(origin || "") });
    }

    const { searchParams } = new URL(request.url);
    const guestId = searchParams.get('id');

    if (!guestId) {
      await auditLogger.logFailure('delete_guest', 'Missing guest ID', {
        userId: user.id,
        ipAddress: ip,
        userAgent,
      });
      return NextResponse.json({ error: 'معرف الضيف مطلوب' }, { status: 400, headers: getCorsHeaders(origin || "") });
    }

    // حذف الضيف
    const { error } = await supabase
      .from('attendees')
      .delete()
      .eq('id', guestId);

    if (error) throw error;

    // ✅ تقليل العداد
    await decrementGuestsUsed(user.id);

    // 📝 Log success
    await auditLogger.logSuccess('delete_guest', {
      userId: user.id,
      guestId,
      ipAddress: ip,
      userAgent,
    });

    // 📊 Track metrics
    metricsCollector.incrementCounter('api_guests_deleted', 1, { userId: user.id });

    // 📊 Track request duration
    const duration = Date.now() - startTime;
    metricsCollector.recordHistogram('api_request_duration_ms', duration, { route: '/api/guests', method: 'DELETE' });

    return NextResponse.json({ success: true }, { headers: getCorsHeaders(origin || "") });

  } catch (error) {
    // 📝 Log error
    await auditLogger.logFailure('delete_guest', error instanceof Error ? error.message : 'Unknown error', {
      ipAddress: ip,
      userAgent,
    });

    // 📊 Track error
    metricsCollector.incrementCounter('api_errors', 1, { route: '/api/guests', method: 'DELETE' });

    return handleApiError(error, 'guests_delete');
  }
}

// ✅ Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');

  if (!origin || !isOriginAllowed(origin)) {
    return new NextResponse(null, { status: 403 });
  }

  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin || ""),
  });
}
