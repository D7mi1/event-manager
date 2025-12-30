/**
 * مجموعة من دوال التحقق (Validation) المستخدمة في التطبيق
 */

/**
 * التحقق من صيغة البريد الإلكتروني
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * التحقق من أن البريد الإلكتروني ليس فارغاً
 */
export const validateEmailNotEmpty = (email: string): string | null => {
  if (!email.trim()) {
    return 'البريد الإلكتروني مطلوب';
  }
  if (!validateEmail(email)) {
    return 'صيغة البريد الإلكتروني غير صحيحة';
  }
  return null;
};

/**
 * التحقق من صحة رقم الهاتف بناءً على عدد الأرقام المتوقعة
 */
export const validatePhone = (
  phone: string,
  expectedDigits: number
): boolean => {
  const cleanPhone = phone.replace(/[^0-9]/g, '');
  return cleanPhone.length === expectedDigits;
};

/**
 * التحقق من الهاتف مع رسالة خطأ
 */
export const validatePhoneNotEmpty = (
  phone: string,
  expectedDigits: number,
  countryName?: string
): string | null => {
  if (!phone.trim()) {
    return 'رقم الهاتف مطلوب';
  }
  if (!validatePhone(phone, expectedDigits)) {
    return `رقم الهاتف يجب أن يحتوي على ${expectedDigits} أرقام`;
  }
  return null;
};

/**
 * التحقق من أن الحقل ليس فارغاً (محدثة لتقبل الأرقام والقيم الفارغة بأمان) ✅
 */
export const validateRequired = (value: any, fieldName: string): string | null => {
  // 1. إذا كانت القيمة null أو undefined -> خطأ
  if (value === null || value === undefined) {
    return `${fieldName} مطلوب`;
  }

  // 2. إذا كانت القيمة نصاً (String) -> نتحقق من المسافات
  if (typeof value === 'string') {
    if (!value.trim()) {
      return `${fieldName} مطلوب`;
    }
  }

  // 3. إذا كانت القيمة رقماً أو أي شيء آخر موجود -> مقبول
  return null;
};

/**
 * التحقق من أن الكلمة تحتوي على أقل من عدد معين من الأحرف
 */
export const validateMinLength = (
  value: string,
  minLength: number,
  fieldName: string
): string | null => {
  if (value.length < minLength) {
    return `${fieldName} يجب أن يكون على الأقل ${minLength} أحرف`;
  }
  return null;
};

/**
 * التحقق من أن الكلمة تحتوي على أكثر من عدد معين من الأحرف
 */
export const validateMaxLength = (
  value: string,
  maxLength: number,
  fieldName: string
): string | null => {
  if (value.length > maxLength) {
    return `${fieldName} يجب أن يكون أقل من ${maxLength} أحرف`;
  }
  return null;
};

/**
 * التحقق من أن القيمة عبارة عن رقم صحيح موجب
 */
export const validatePositiveNumber = (
  value: any,
  fieldName: string
): string | null => {
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return `${fieldName} يجب أن يكون رقماً موجباً`;
  }
  return null;
};

/**
 * تنظيف رقم الهاتف بإزالة جميع الأحرف غير الرقمية
 */
export const cleanPhoneNumber = (phone: string): string => {
  return phone.replace(/[^0-9]/g, '');
};

/**
 * تنسيق رقم الهاتف بناءً على رمز الدولة
 */
export const formatPhoneNumber = (
  phone: string,
  countryCode: string
): string => {
  let cleanPhone = cleanPhoneNumber(phone);

  // إذا كان الرقم يبدأ بـ 0، استبدلها برمز الدولة
  if (cleanPhone.startsWith('0')) {
    cleanPhone = countryCode + cleanPhone.substring(1);
  }
  // إذا كان الرقم يبدأ برقم عادي، أضف رمز الدولة
  else if (!cleanPhone.startsWith(countryCode)) {
    cleanPhone = countryCode + cleanPhone;
  }

  return cleanPhone;
};

/**
 * التحقق من صحة تاريخ معين
 */
export const validateDate = (dateString: string): string | null => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'التاريخ غير صحيح';
    }
    return null;
  } catch {
    return 'التاريخ غير صحيح';
  }
};

/**
 * التحقق من أن التاريخ في المستقبل
 */
export const validateFutureDate = (dateString: string): string | null => {
  const dateError = validateDate(dateString);
  if (dateError) return dateError;

  const date = new Date(dateString);
  const now = new Date();

  if (date <= now) {
    return 'يجب اختيار تاريخ في المستقبل';
  }

  return null;
};

/**
 * التحقق من أن جميع حقول النموذج صحيحة
 */
export const validateForm = (
  validations: Record<string, string | null>
): boolean => {
  return Object.values(validations).every((error) => error === null);
};

/**
 * الحصول على جميع أخطاء النموذج
 */
export const getFormErrors = (
  validations: Record<string, string | null>
): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(validations).filter(([, error]) => error !== null)
  ) as Record<string, string>;
};