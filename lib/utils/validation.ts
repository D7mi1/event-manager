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

/**
 * ✅ التحقق من عنوان الفعالية
 */
export const validateEventTitle = (title: string | null | undefined): string | null => {
  if (!title?.trim()) {
    return 'عنوان الفعالية مطلوب';
  }
  if (title.length < 3) {
    return 'العنوان قصير جداً (3 أحرف على الأقل)';
  }
  if (title.length > 200) {
    return 'العنوان طويل جداً (200 حرف كحد أقصى)';
  }
  return null;
};

/**
 * ✅ التحقق من تواريخ الفعالية
 */
export const validateEventDate = (
  startDate: Date | string | null | undefined,
  endDate: Date | string | null | undefined
): string | null => {
  if (!startDate || !endDate) {
    return 'يجب تحديد تاريخ البداية والنهاية';
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  const now = new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return 'صيغة التاريخ غير صحيحة';
  }

  if (start >= end) {
    return 'تاريخ البداية يجب أن يكون قبل تاريخ النهاية';
  }

  if (start < new Date(now.getTime() - 24 * 60 * 60 * 1000)) {
    return 'لا يمكن إنشاء فعالية في الماضي';
  }

  return null;
};

/**
 * ✅ التحقق من رمز PIN
 */
export const validatePin = (pin: string | null | undefined): string | null => {
  if (!pin) {
    return 'PIN مطلوب';
  }

  // يجب أن يكون أرقام فقط
  if (!/^\d+$/.test(pin)) {
    return 'PIN يجب أن يحتوي على أرقام فقط';
  }

  // من 4 إلى 6 أرقام
  if (pin.length < 4 || pin.length > 6) {
    return 'PIN يجب أن يكون 4-6 أرقام';
  }

  // تحقق من أنه ليس نفس الأرقام المتكررة (مثل 1111)
  if (/^(\d)\1{3,}$/.test(pin)) {
    return 'PIN ضعيف جداً - لا تستخدم نفس الرقم بشكل متكرر';
  }

  return null;
};

/**
 * ✅ التحقق من عدد الضيوف
 */
export const validateGuestCount = (
  count: number | null | undefined,
  limit: number
): string | null => {
  if (count === null || count === undefined) {
    return 'عدد الضيوف مطلوب';
  }

  if (typeof count !== 'number' || count < 0) {
    return 'عدد الضيوف يجب أن يكون رقماً موجباً';
  }

  if (count > limit) {
    return `لا يمكن إضافة أكثر من ${limit} ضيف حسب خطتك`;
  }

  return null;
};

/**
 * ✅ التحقق من الموقع
 */
export const validateLocation = (location: string | null | undefined): string | null => {
  if (!location?.trim()) {
    return 'الموقع مطلوب';
  }

  if (location.length < 3) {
    return 'الموقع قصير جداً';
  }

  if (location.length > 300) {
    return 'الموقع طويل جداً';
  }

  return null;
};

/**
 * ✅ التحقق من نوع الفعالية
 */
export const validateEventType = (
  type: string | null | undefined
): string | null => {
  const validTypes = ['conference', 'workshop', 'exhibition', 'business'];

  if (!type) {
    return 'نوع الفعالية مطلوب';
  }

  if (!validTypes.includes(type)) {
    return `نوع الفعالية يجب أن يكون: ${validTypes.join(' أو ')}`;
  }

  return null;
};

/**
 * ✅ التحقق من وصف الفعالية
 */
export const validateEventDescription = (
  description: string | null | undefined
): string | null => {
  if (!description) return null; // وصف اختياري

  if (description.length > 1000) {
    return 'الوصف طويل جداً (1000 حرف كحد أقصى)';
  }

  return null;
};

/**
 * ✅ التحقق الشامل من بيانات الفعالية
 */
export const validateEventData = (eventData: {
  title?: string;
  type?: string;
  location?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  description?: string;
  pin?: string;
}): Record<string, string> => {
  const errors: Record<string, string> = {};

  if (eventData.title !== undefined) {
    const titleError = validateEventTitle(eventData.title);
    if (titleError) errors.title = titleError;
  }

  if (eventData.type !== undefined) {
    const typeError = validateEventType(eventData.type);
    if (typeError) errors.type = typeError;
  }

  if (eventData.location !== undefined) {
    const locationError = validateLocation(eventData.location);
    if (locationError) errors.location = locationError;
  }

  if (eventData.startDate || eventData.endDate) {
    const dateError = validateEventDate(eventData.startDate, eventData.endDate);
    if (dateError) errors.date = dateError;
  }

  if (eventData.description !== undefined) {
    const descError = validateEventDescription(eventData.description);
    if (descError) errors.description = descError;
  }

  if (eventData.pin !== undefined) {
    const pinError = validatePin(eventData.pin);
    if (pinError) errors.pin = pinError;
  }

  return errors;
};