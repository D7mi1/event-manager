import { NextResponse } from 'next/server'
import { createClient } from '@/app/utils/supabase/server'
import { templateSchema } from '@/app/utils/templateSchema'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const eventId = searchParams.get('eventId')
    const templateType = searchParams.get('templateType')

    if (!eventId) {
      return NextResponse.json(
        { error: 'eventId مطلوب' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // التحقق من ملكية الفعالية
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, owner_id')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'الفعالية غير موجودة' },
        { status: 404 }
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

    return NextResponse.json({ templates })
  } catch (error: any) {
    console.error('Template GET error:', error)
    return NextResponse.json(
      { error: error.message || 'خطأ في جلب التصاميم' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { eventId, templateName, templateType, elements, backgroundColor } = body

    if (!eventId || !templateName || !templateType) {
      return NextResponse.json(
        { error: 'المعلومات المطلوبة ناقصة' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // التحقق من ملكية الفعالية
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, owner_id')
      .eq('id', eventId)
      .single()

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'الفعالية غير موجودة' },
        { status: 404 }
      )
    }

    // حفظ التصميم
    const { data: template, error: insertError } = await supabase
      .from('event_templates')
      .insert([
        {
          event_id: eventId,
          template_name: templateName,
          template_type: templateType,
          template_category: 'wedding', // Default
          elements: elements || [],
          background_color: backgroundColor || '#ffffff',
        },
      ])
      .select()
      .single()

    if (insertError) {
      throw insertError
    }

    return NextResponse.json(
      { template, message: 'تم حفظ التصميم بنجاح' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('Template POST error:', error)
    return NextResponse.json(
      { error: error.message || 'خطأ في حفظ التصميم' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { templateId, templateName, elements, backgroundColor } = body

    if (!templateId) {
      return NextResponse.json(
        { error: 'templateId مطلوب' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

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

    if (updateError) {
      throw updateError
    }

    return NextResponse.json(
      { template, message: 'تم تحديث التصميم بنجاح' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Template PUT error:', error)
    return NextResponse.json(
      { error: error.message || 'خطأ في تحديث التصميم' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const templateId = searchParams.get('templateId')

    if (!templateId) {
      return NextResponse.json(
        { error: 'templateId مطلوب' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error: deleteError } = await supabase
      .from('event_templates')
      .delete()
      .eq('id', templateId)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json(
      { message: 'تم حذف التصميم بنجاح' },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('Template DELETE error:', error)
    return NextResponse.json(
      { error: error.message || 'خطأ في حذف التصميم' },
      { status: 500 }
    )
  }
}
