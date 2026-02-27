/**
 * ActionResult<T> - نمط موحد لنتائج Server Actions
 * ========================================
 * بدل ما كل Server Action يرجع شكل مختلف،
 * هذا النمط يوحّد الشكل: { success, data?, error? }
 *
 * مستوحى من production-saas-starter kit
 */

// نوع النتيجة الموحد
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

// ——— Helper Functions ———

/**
 * إنشاء نتيجة نجاح
 */
export function actionSuccess<T>(data: T): ActionResult<T> {
  return { success: true, data };
}

/**
 * إنشاء نتيجة نجاح بدون بيانات
 */
export function actionOk(): ActionResult<void> {
  return { success: true, data: undefined };
}

/**
 * إنشاء نتيجة فشل
 */
export function actionError<T = never>(error: string): ActionResult<T> {
  return { success: false, error };
}

/**
 * غلاف لمعالجة الأخطاء تلقائياً في Server Actions
 *
 * @example
 * ```ts
 * export async function createEvent(data: EventInput): Promise<ActionResult<{ id: string }>> {
 *   return withAction(async () => {
 *     const event = await supabase.from('events').insert(data).select().single();
 *     if (event.error) throw new Error('فشل إنشاء الفعالية');
 *     return { id: event.data.id };
 *   });
 * }
 * ```
 */
export async function withAction<T>(
  fn: () => Promise<T>
): Promise<ActionResult<T>> {
  try {
    const data = await fn();
    return { success: true, data };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'حدث خطأ غير متوقع';

    // تسجيل الخطأ في development
    if (process.env.NODE_ENV === 'development') {
      console.error('[ActionError]', err);
    }

    return { success: false, error: message };
  }
}

/**
 * غلاف مع التحقق من المصادقة
 *
 * @example
 * ```ts
 * export async function deleteEvent(id: string): Promise<ActionResult<void>> {
 *   return withAuthAction(async (userId) => {
 *     await supabase.from('events').delete().eq('id', id).eq('user_id', userId);
 *   });
 * }
 * ```
 */
export async function withAuthAction<T>(
  fn: (userId: string) => Promise<T>
): Promise<ActionResult<T>> {
  try {
    // Dynamic import لتجنب مشاكل client/server
    const { createClient } = await import('@/app/utils/supabase/server');
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return { success: false, error: 'يجب تسجيل الدخول أولاً' };
    }

    const data = await fn(user.id);
    return { success: true, data };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'حدث خطأ غير متوقع';

    if (process.env.NODE_ENV === 'development') {
      console.error('[AuthActionError]', err);
    }

    return { success: false, error: message };
  }
}
