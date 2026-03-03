import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { templateSchema } from '@/lib/schemas/template'
import { auditLogger } from '@/lib/audit-logger'
import { metricsCollector } from '@/lib/metrics'
import { getCorsHeaders, isOriginAllowed } from '@/lib/cors'

// Helper to get client IP
function getClientIP(request: Request | NextRequest): string {
  const headersList = request.headers;
  return (headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || '0.0.0.0').split(',')[0].trim();
}

// Helper to get user agent
function getUserAgent(request: Request | NextRequest): string {
  return request.headers.get('user-agent') || 'Unknown';
}

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIP(request);
  const userAgent = getUserAgent(request);
  const origin = request.headers.get('origin');

  try {
    // ✅ CORS Check
    if (origin && !isOriginAllowed(origin)) {
      await auditLogger.logSuspicious('get_templates', {
        ipAddress: ip,
        userAgent,
        reason: 'CORS origin not allowed',
      });
      return new NextResponse('CORS not allowed', { status: 403 });
    }

    const supabase = await createClient()

    // ✅ Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getCorsHeaders(origin) });
    }

    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const templateType = searchParams.get('templateType')

    if (!eventId) {
      await auditLogger.logFailure('get_templates', 'Missing eventId parameter', {
        ipAddress: ip,
        userAgent,
      });
      return NextResponse.json(
        { error: 'eventId مطلوب' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    // ✅ التحقق من ملكية الفعالية
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, user_id')
      .eq('id', eventId)
      .eq('user_id', user.id)
      .single()

    if (eventError || !event) {
      await auditLogger.logFailure('get_templates', 'Event not found or not owned', {
        ipAddress: ip,
        userAgent,
        eventId,
      });
      return NextResponse.json(
        { error: 'الفعالية غير موجودة' },
        { status: 404, headers: getCorsHeaders(origin) }
      )
    }

    // جلب التصميم
    const query = supabase
      .from('event_templates')
      .select('*')
      .eq('event_id', eventId)

    if (templateType) {
      query.eq('template_type', templateType)
    }

    const { data: templates, error: templatesError } = await query

    if (templatesError) {
      throw templatesError
    }

    // 📝 Log success
    await auditLogger.logSuccess('get_templates', {
      ipAddress: ip,
      userAgent,
      eventId,
      details: { templateCount: templates?.length || 0 },
    });

    // 📊 Track metrics
    metricsCollector.incrementCounter('api_templates_retrieved', templates?.length || 0, { eventId });

    // 📊 Track request duration
    const duration = Date.now() - startTime;
    metricsCollector.recordHistogram('api_request_duration_ms', duration, { route: '/api/templates', method: 'GET' });

    return NextResponse.json(
      { templates },
      { headers: getCorsHeaders(origin) }
    )
  } catch (error: any) {
    await auditLogger.logFailure('get_templates', error.message || 'Unknown error', {
      ipAddress: ip,
      userAgent,
    });
    metricsCollector.incrementCounter('api_errors', 1, { route: '/api/templates', method: 'GET' });
    console.error('Template GET error:', error)
    return NextResponse.json(
      { error: 'خطأ في جلب التصاميم' },
      { status: 500, headers: getCorsHeaders(origin) }
    )
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIP(request);
  const userAgent = getUserAgent(request);
  const origin = request.headers.get('origin');

  try {
    if (origin && !isOriginAllowed(origin)) {
      await auditLogger.logSuspicious('create_template', { ipAddress: ip, userAgent, reason: 'CORS origin not allowed' });
      return new NextResponse('CORS not allowed', { status: 403 });
    }

    const supabase = await createClient()

    // ✅ Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getCorsHeaders(origin) });
    }

    const body = await request.json()
    const { eventId, templateName, templateType, elements, backgroundColor } = body

    if (!eventId || !templateName || !templateType) {
      return NextResponse.json(
        { error: 'المعلومات المطلوبة ناقصة' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    // ✅ التحقق من ملكية الفعالية
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, user_id')
      .eq('id', eventId)
      .eq('user_id', user.id)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'الفعالية غير موجودة أو لا تملك صلاحية' },
        { status: 403, headers: getCorsHeaders(origin) }
      )
    }

    const { data: template, error: insertError } = await supabase
      .from('event_templates')
      .insert([{
        event_id: eventId,
        template_name: templateName,
        template_type: templateType,
        template_category: 'corporate',
        elements: elements || [],
        background_color: backgroundColor || '#ffffff',
      }])
      .select()
      .single()

    if (insertError) throw insertError

    await auditLogger.logSuccess('create_template', { ipAddress: ip, userAgent, eventId, details: { templateId: template?.id, templateName } });
    metricsCollector.incrementCounter('api_templates_created', 1, { eventId });
    const duration = Date.now() - startTime;
    metricsCollector.recordHistogram('api_request_duration_ms', duration, { route: '/api/templates', method: 'POST' });

    return NextResponse.json(
      { template, message: 'تم حفظ التصميم بنجاح' },
      { status: 201, headers: getCorsHeaders(origin) }
    )
  } catch (error: any) {
    await auditLogger.logFailure('create_template', error.message || 'Unknown error', { ipAddress: ip, userAgent });
    metricsCollector.incrementCounter('api_errors', 1, { route: '/api/templates', method: 'POST' });
    console.error('Template POST error:', error)
    return NextResponse.json(
      { error: 'خطأ في حفظ التصميم' },
      { status: 500, headers: getCorsHeaders(origin) }
    )
  }
}

export async function PUT(request: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIP(request);
  const userAgent = getUserAgent(request);
  const origin = request.headers.get('origin');

  try {
    if (origin && !isOriginAllowed(origin)) {
      await auditLogger.logSuspicious('update_template', { ipAddress: ip, userAgent, reason: 'CORS origin not allowed' });
      return new NextResponse('CORS not allowed', { status: 403 });
    }

    const supabase = await createClient()

    // ✅ Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getCorsHeaders(origin) });
    }

    const body = await request.json()
    const { templateId, templateName, elements, backgroundColor } = body

    if (!templateId) {
      return NextResponse.json(
        { error: 'templateId مطلوب' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    // ✅ التحقق من ملكية القالب عبر الفعالية
    const { data: existing } = await supabase
      .from('event_templates')
      .select('id, events!inner(user_id)')
      .eq('id', templateId)
      .single();

    if (!existing || (existing as any).events?.user_id !== user.id) {
      return NextResponse.json({ error: 'لا تملك صلاحية تعديل هذا القالب' }, { status: 403, headers: getCorsHeaders(origin) });
    }

    const { data: template, error: updateError } = await supabase
      .from('event_templates')
      .update({
        template_name: templateName,
        elements: elements || [],
        background_color: backgroundColor || '#ffffff',
        updated_at: new Date().toISOString(),
      })
      .eq('id', templateId)
      .select()
      .single()

    if (updateError) throw updateError

    await auditLogger.logSuccess('update_template', { ipAddress: ip, userAgent, details: { templateId, templateName } });
    metricsCollector.incrementCounter('api_templates_updated', 1, {});
    const duration = Date.now() - startTime;
    metricsCollector.recordHistogram('api_request_duration_ms', duration, { route: '/api/templates', method: 'PUT' });

    return NextResponse.json(
      { template, message: 'تم تحديث التصميم بنجاح' },
      { status: 200, headers: getCorsHeaders(origin) }
    )
  } catch (error: any) {
    await auditLogger.logFailure('update_template', error.message || 'Unknown error', { ipAddress: ip, userAgent });
    metricsCollector.incrementCounter('api_errors', 1, { route: '/api/templates', method: 'PUT' });
    console.error('Template PUT error:', error)
    return NextResponse.json(
      { error: 'خطأ في تحديث التصميم' },
      { status: 500, headers: getCorsHeaders(origin) }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const startTime = Date.now();
  const ip = getClientIP(request);
  const userAgent = getUserAgent(request);
  const origin = request.headers.get('origin');

  try {
    if (origin && !isOriginAllowed(origin)) {
      await auditLogger.logSuspicious('delete_template', { ipAddress: ip, userAgent, reason: 'CORS origin not allowed' });
      return new NextResponse('CORS not allowed', { status: 403 });
    }

    const supabase = await createClient()

    // ✅ Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: getCorsHeaders(origin) });
    }

    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('templateId')

    if (!templateId) {
      return NextResponse.json(
        { error: 'templateId مطلوب' },
        { status: 400, headers: getCorsHeaders(origin) }
      )
    }

    // ✅ التحقق من ملكية القالب عبر الفعالية
    const { data: existing } = await supabase
      .from('event_templates')
      .select('id, events!inner(user_id)')
      .eq('id', templateId)
      .single();

    if (!existing || (existing as any).events?.user_id !== user.id) {
      return NextResponse.json({ error: 'لا تملك صلاحية حذف هذا القالب' }, { status: 403, headers: getCorsHeaders(origin) });
    }

    const { error: deleteError } = await supabase
      .from('event_templates')
      .delete()
      .eq('id', templateId)

    if (deleteError) throw deleteError

    await auditLogger.logSuccess('delete_template', { ipAddress: ip, userAgent, details: { templateId } });
    metricsCollector.incrementCounter('api_templates_deleted', 1, {});
    const duration = Date.now() - startTime;
    metricsCollector.recordHistogram('api_request_duration_ms', duration, { route: '/api/templates', method: 'DELETE' });

    return NextResponse.json(
      { message: 'تم حذف التصميم بنجاح' },
      { status: 200, headers: getCorsHeaders(origin) }
    )
  } catch (error: any) {
    await auditLogger.logFailure('delete_template', error.message || 'Unknown error', { ipAddress: ip, userAgent });
    metricsCollector.incrementCounter('api_errors', 1, { route: '/api/templates', method: 'DELETE' });
    console.error('Template DELETE error:', error)
    return NextResponse.json(
      { error: 'خطأ في حذف التصميم' },
      { status: 500, headers: getCorsHeaders(origin) }
    )
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
    headers: getCorsHeaders(origin),
  });
}
