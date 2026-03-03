// ============================================================
// 📘 مثال عملي: كيفية استخدام Validation و Error Handler
// ============================================================

/**
 * مثال 1: API Route لإنشاء فعالية جديدة
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateEventData, validatePin } from '@/lib/utils/validation';
import { handleApiError, validationError, unauthorizedError } from '@/lib/utils/api-error-handler';
import { hashPin } from '@/app/actions/verifyPin';
import { createClient } from '@/lib/supabase/server';

// Example: POST /api/events
export async function exampleCreateEvent(request: NextRequest) {
  try {
    // 1. التحقق من أن المستخدم مسجل دخول
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return handleApiError(unauthorizedError('يجب تسجيل الدخول أولاً'));
    }

    // 2. قراءة البيانات من الطلب
    const body = await request.json();

    // 3. التحقق من البيانات
    const errors = validateEventData({
      title: body.title,
      type: body.type,
      location: body.location,
      startDate: body.startDate,
      endDate: body.endDate,
      description: body.description,
      pin: body.pin,
    });

    if (Object.keys(errors).length > 0) {
      // ❌ بيانات غير صحيحة
      return handleApiError(
        validationError(`بيانات غير صحيحة: ${Object.values(errors).join(', ')}`),
        'event_creation'
      );
    }

    // 4. تشفير PIN
    const pinHash = await hashPin(body.pin);

    // 5. حفظ الفعالية في قاعدة البيانات
    const { data, error } = await supabase
      .from('events')
      .insert({
        user_id: user.id,
        title: body.title,
        type: body.type,
        location: body.location,
        start_date: body.startDate,
        end_date: body.endDate,
        description: body.description,
        pin_hash: pinHash, // ✅ نحفظ PIN مشفر
        is_public: false,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // 6. إرسال الرد
    return NextResponse.json({
      success: true,
      event: {
        id: data.id,
        title: data.title,
        type: data.type,
        location: data.location,
      },
    }, { status: 201 });

  } catch (error) {
    // معالجة آمنة للأخطاء
    return handleApiError(error, 'event_creation');
  }
}


/**
 * مثال 2: API Route للتحقق من PIN
 */

export async function exampleVerifyPin(request: NextRequest) {
  try {
    const { eventId, pin } = await request.json();

    // 1. التحقق من صحة الـ PIN
    const pinError = validatePin(pin);
    if (pinError) {
      return handleApiError(validationError(pinError), 'verify_pin');
    }

    // 2. استدعاء دالة التحقق من PIN
    // const { success, error } = await verifyEventPin(eventId, pin);

    // if (!success) {
    //   لا تخبر المستخدم إذا كان PIN خاطئ أم الفعالية غير موجودة
    //   return handleApiError(
    //     validationError('بيانات الدخول غير صحيحة'),
    //     'verify_pin'
    //   );
    // }

    return NextResponse.json({
      success: true,
      message: 'تم التحقق بنجاح',
    });

  } catch (error) {
    return handleApiError(error, 'verify_pin');
  }
}


// ============================================================
// ملخص أفضل الممارسات
// ============================================================

/*

✅ افعل:
1. تحقق من البيانات دائماً على frontend و backend
2. استخدم bcrypt لتشفير passwords و PINs
3. اخفِ تفاصيل الخطأ في production
4. استخدم RLS على جميع الجداول
5. سجّل الأنشطة الحساسة

❌ لا تفعل:
1. لا تثق بـ frontend validation فقط
2. لا تحفظ passwords بدون تشفير
3. لا تعرض stack traces للمستخدم العادي
4. لا تسمح بـ SELECT للجميع
5. لا تضع secrets في الـ code

📋 قائمة التحقق:
- [ ] جميع البيانات مُتحقق منها
- [ ] جميع الأخطاء معالجة
- [ ] PINs و passwords مشفرة
- [ ] RLS مفعّل على الجداول
- [ ] الأخطاء لا تسرب معلومات
- [ ] HTTPS مفعّل
- [ ] CORS مضبوط
- [ ] لا توجد secrets في الـ code

*/

// ============================================================
// أمثلة استخدام الـ Validation في Frontend
// ============================================================

/*

// استخدام في أي صفحة React:

import { validateEventData, validatePin } from '@/lib/utils/validation';

export default function CreateEventPage() {
  const [formData, setFormData] = useState({
    title: '',
    type: '',
    location: '',
    startDate: '',
    endDate: '',
    description: '',
    pin: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. التحقق من البيانات
    const validationErrors = validateEventData(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // 2. إرسال الطلب
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error);
        return;
      }

      alert('تم إنشاء الفعالية بنجاح!');
    } catch (error) {
      alert('حدث خطأ أثناء الإنشاء');
    }
  };

  // JSX مع عرض الأخطاء...
}

*/
