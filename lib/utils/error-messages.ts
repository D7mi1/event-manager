/**
 * رسائل أخطاء آمنة - لا تكشف معلومات حساسة للـ client
 */

export const ERROR_MESSAGES = {
  INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة',
  INVALID_INPUT: 'البيانات المدخلة غير صحيحة',
  UNAUTHORIZED: 'غير مصرح بالوصول',
  FORBIDDEN: 'ليس لديك صلاحيات كافية',
  NOT_FOUND: 'المورد المطلوب غير موجود',
  SERVER_ERROR: 'حدث خطأ في النظام، الرجاء المحاولة لاحقاً',
  TOO_MANY_REQUESTS: 'تم تجاوز عدد المحاولات المسموحة، حاول مجدداً لاحقاً',
  NETWORK_ERROR: 'خطأ في الاتصال، الرجاء التحقق من الإنترنت والمحاولة مجدداً',
  VALIDATION_ERROR: 'البيانات المدخلة غير صحيحة',
  DATABASE_ERROR: 'خطأ في قاعدة البيانات، الرجاء المحاولة لاحقاً',
  OPERATION_FAILED: 'فشلت العملية، الرجاء المحاولة مجدداً',
} as const;

/**
 * دالة آمنة لإرجاع رسالة خطأ
 */
export function getSafeErrorMessage(
  error: unknown,
  fallbackMessage: string = ERROR_MESSAGES.SERVER_ERROR
): string {
  if (process.env.NODE_ENV === 'development') {
    console.error('Error details:', error);
  }
  return fallbackMessage;
}
