/**
 * lib/schemas.ts
 * المصدر الوحيد لجميع مخططات التحقق (Zod Schemas) في المشروع
 * تم توحيد: app/utils/schemas.ts + lib/validation-schemas.ts + lib/schemas.ts
 */

import { z } from 'zod';

// ============================================
// Custom Refinements
// ============================================

/**
 * التحقق من PIN ضعيف (أنماط شائعة)
 */
const isWeakPin = (pin: string): boolean => {
  const weakPatterns = [
    '0000', '1111', '2222', '3333', '4444',
    '5555', '6666', '7777', '8888', '9999',
    '1234', '4321', '1212', '2121',
  ];
  return weakPatterns.includes(pin);
};

/**
 * التحقق من كلمة مرور قوية
 */
export const isStrongPassword = (password: string): boolean => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
};

// ============================================
// Field Schemas (حقول مشتركة قابلة لإعادة الاستخدام)
// ============================================

export const phoneSchema = z
  .string()
  .min(1, 'رقم الهاتف مطلوب')
  .regex(/^[0-9+\-\s()]+$/, 'رقم الهاتف غير صحيح')
  .refine((phone) => phone.replace(/[^0-9]/g, '').length >= 7, {
    message: 'رقم الهاتف يجب أن يكون على الأقل 7 أرقام',
  });

export const phoneSchemaOptional = z
  .string()
  .regex(/^[0-9+\-\s()]+$/, 'رقم الهاتف غير صحيح')
  .min(7, 'رقم الهاتف قصير جداً')
  .optional();

export const emailSchema = z
  .string()
  .email('صيغة البريد الإلكتروني غير صحيحة')
  .toLowerCase()
  .trim();

export const emailSchemaRequired = emailSchema
  .min(1, 'البريد الإلكتروني مطلوب');

export const nameSchema = z
  .string()
  .min(2, 'الاسم يجب أن يكون على الأقل حرفين')
  .max(100, 'الاسم يجب أن يكون أقل من 100 حرف')
  .trim();

export const pinSchema = z
  .string()
  .regex(/^\d{4,6}$/, 'الرمز يجب أن يكون 4-6 أرقام')
  .refine(
    (pin) => !isWeakPin(pin),
    'الرمز ضعيف جداً - الرجاء استخدام رمز أقوى'
  );

// ============================================
// Auth Schemas
// ============================================

export const LoginSchema = z.object({
  email: emailSchema.min(1, 'البريد الإلكتروني مطلوب'),
  password: z.string()
    .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
    .max(128, 'كلمة المرور طويلة جداً'),
});

export type LoginInput = z.infer<typeof LoginSchema>;

/** Schema لتسجيل حساب جديد */
export const SignUpSchema = z.object({
  fullName: z.string().min(1, 'لطفاً، زودنا باسمك لنتمكن من تخصيص تجربتك.').max(100, 'الاسم طويل جداً').trim(),
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('عذراً، صيغة البريد الإلكتروني غير صحيحة.').toLowerCase().trim(),
  phone: z.string().min(1, 'رقم الجوال مطلوب').regex(/^\d+$/, 'رقم الجوال يجب أن يحتوي على أرقام فقط'),
  password: z.string().min(8, 'كلمة المرور ضعيفة (8 خانات على الأقل)').regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'كلمة المرور يجب أن تحتوي على حرف كبير وصغير ورقم'),
  confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة.',
  path: ['confirmPassword'],
});

export type SignUpInput = z.infer<typeof SignUpSchema>;

/** Schema لتسجيل الدخول بكلمة المرور */
export const LoginPasswordSchema = z.object({
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('عذراً، صيغة البريد الإلكتروني غير صحيحة.').toLowerCase().trim(),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export type LoginPasswordInput = z.infer<typeof LoginPasswordSchema>;

/** Schema لإرسال OTP */
export const OtpRequestSchema = z.object({
  email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('عذراً، صيغة البريد الإلكتروني غير صحيحة.').toLowerCase().trim(),
});

export type OtpRequestInput = z.infer<typeof OtpRequestSchema>;

/** Schema للتحقق من OTP */
export const OtpVerifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, 'رمز التحقق يجب أن يكون 6 أرقام').regex(/^\d{6}$/, 'الرمز يجب أن يحتوي على أرقام فقط'),
});

export type OtpVerifyInput = z.infer<typeof OtpVerifySchema>;

// ============================================
// Event Schemas
// ============================================

export const EventCreateSchema = z.object({
  title: z.string()
    .min(3, 'عنوان الفعالية قصير جداً (3 أحرف على الأقل)')
    .max(200, 'عنوان الفعالية طويل جداً (200 حرف كحد أقصى)')
    .trim(),
  description: z.string()
    .max(1000, 'الوصف طويل جداً (1000 حرف كحد أقصى)')
    .optional()
    .default(''),
  date: z.coerce.date()
    .refine(
      (date) => date > new Date(),
      'التاريخ يجب أن يكون في المستقبل'
    ),
  location: z.string()
    .max(300, 'الموقع طويل جداً')
    .optional(),
  type: z.enum(['conference', 'workshop', 'exhibition', 'business']).default('business'),
  capacity: z.coerce.number()
    .int('السعة يجب أن تكون رقم صحيح')
    .positive('السعة يجب أن تكون موجبة')
    .max(10000, 'السعة أكبر من الحد الأقصى (10000)'),
  pin: pinSchema,
});

export type EventCreateInput = z.infer<typeof EventCreateSchema>;

export const EventUpdateSchema = EventCreateSchema.partial();
export type EventUpdateInput = z.infer<typeof EventUpdateSchema>;

/** Schema لبيانات الفعالية من قاعدة البيانات */
export const eventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'اسم الفعالية مطلوب'),
  date: z.string().datetime('التاريخ غير صحيح'),
  location_name: z.string().min(1, 'الموقع مطلوب'),
  type: z.enum(['conference', 'workshop', 'exhibition', 'business']),
  user_id: z.string().optional(),
  status: z.enum(['active', 'draft']).optional(),
  guests_count: z.number().optional(),
  is_registration_open: z.boolean().optional(),
});

export type EventData = z.infer<typeof eventSchema>;

// ============================================
// PIN Verification Schemas
// ============================================

/** Schema بسيط للتحقق من PIN (يستخدم في server action) */
export const VerifyPinSchema = z.object({
  eventId: z.string().uuid({ message: 'معرف الفعالية غير صالح' }),
  inputPin: z.string().min(1, { message: 'الرجاء إدخال رمز الدخول' }),
});

/** Schema متقدم للتحقق من PIN (مع فحص الضعف) */
export const PINVerificationSchema = z.object({
  eventId: z.string().uuid('معرّف الفعالية غير صحيح'),
  pin: pinSchema,
});

export type PINVerificationInput = z.infer<typeof PINVerificationSchema>;

// ============================================
// Guest / Attendee Schemas
// ============================================

export const GuestAddSchema = z.object({
  eventId: z.string().uuid(),
  name: nameSchema,
  email: emailSchema.optional(),
  phone: phoneSchemaOptional,
  guestType: z.enum(['vip', 'standard', 'media', 'staff']).default('standard'),
});

export type GuestAddInput = z.infer<typeof GuestAddSchema>;

export const attendeeSchema = z.object({
  id: z.string().uuid(),
  event_id: z.string().uuid(),
  name: z.string(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'declined']),
  created_at: z.string().datetime(),
  check_in_time: z.string().datetime().nullable().optional(),
  attended: z.boolean().optional(),
  regret_reason: z.string().optional(),
});

export type AttendeeData = z.infer<typeof attendeeSchema>;

// ============================================
// Registration & Form Schemas
// ============================================

export const registrationSchema = z.object({
  name: nameSchema,
  email: emailSchemaRequired,
  phone: phoneSchema,
  eventId: z.string().uuid('معرف الفعالية غير صحيح'),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

export const memorySchema = z.object({
  message: z
    .string()
    .min(1, 'الذكرى مطلوبة')
    .max(500, 'الذكرى طويلة جداً (الحد الأقصى 500 حرف)'),
  eventId: z.string().uuid('معرف الفعالية غير صحيح'),
  attendeeId: z.string().uuid('معرف الضيف غير صحيح'),
});

export type MemoryData = z.infer<typeof memorySchema>;

export const regretSchema = z.object({
  reason: z
    .string()
    .max(500, 'السبب طويل جداً (الحد الأقصى 500 حرف)')
    .optional(),
  attendeeId: z.string().uuid('معرف الضيف غير صحيح'),
});

export type RegretData = z.infer<typeof regretSchema>;

// ============================================
// Email Schemas
// ============================================

export const EmailSchema = z.object({
  to: z.string().email('البريد الإلكتروني غير صحيح'),
  subject: z.string()
    .min(5, 'الموضوع قصير جداً')
    .max(200, 'الموضوع طويل جداً'),
  body: z.string()
    .min(10, 'محتوى الرسالة قصير جداً')
    .max(5000, 'محتوى الرسالة طويل جداً'),
});

export type EmailInput = z.infer<typeof EmailSchema>;

// ============================================
// Batch Import Schema
// ============================================

export const BatchImportSchema = z.object({
  eventId: z.string().uuid(),
  guests: z.array(
    z.object({
      name: z.string().min(2).max(100),
      email: z.string().email().optional(),
      phone: z.string().optional(),
    })
  )
    .min(1, 'يجب اختيار ضيف واحد على الأقل')
    .max(500, 'الحد الأقصى 500 ضيف دفعة واحدة'),
});

export type BatchImportInput = z.infer<typeof BatchImportSchema>;

// ============================================
// Dashboard Form Schemas
// ============================================

/** Schema لإضافة مدعو من لوحة التحكم */
export const AddGuestFormSchema = z.object({
  name: z.string().min(1, 'الاسم مطلوب').max(100, 'الاسم طويل جداً').trim(),
  phone: z.string().min(1, 'رقم الجوال مطلوب').regex(/^[0-9+\-\s()]+$/, 'رقم الجوال غير صحيح'),
  category: z.enum(['GENERAL', 'VIP', 'FAMILY']),
});

export type AddGuestFormInput = z.infer<typeof AddGuestFormSchema>;

/** Schema لتعديل بيانات الفعالية */
export const EditEventFormSchema = z.object({
  name: z.string().min(1, 'اسم الفعالية مطلوب').max(200, 'الاسم طويل جداً').trim(),
  location_name: z.string().max(300, 'الموقع طويل جداً'),
});

export type EditEventFormInput = z.infer<typeof EditEventFormSchema>;

/** Schema لتحديث PIN من لوحة التحكم */
export const PinUpdateFormSchema = z.object({
  newPin: z.string()
    .length(4, 'يجب أن يتكون الرمز من 4 أرقام')
    .regex(/^\d{4}$/, 'الرمز يجب أن يحتوي على أرقام فقط'),
});

export type PinUpdateFormInput = z.infer<typeof PinUpdateFormSchema>;

/** Schema لإعدادات الرسائل */
export const MessageConfigFormSchema = z.object({
  reminder: z.object({
    enabled: z.boolean(),
    text: z.string().max(500, 'النص طويل جداً'),
  }),
  location: z.object({
    enabled: z.boolean(),
    text: z.string().max(500, 'النص طويل جداً'),
  }),
});

export type MessageConfigFormInput = z.infer<typeof MessageConfigFormSchema>;

// ============================================
// AI Schemas (توليد النصوص والصور)
// ============================================

export const InvitationTextSchema = z.object({
  eventType: z.string().optional(),
  guestName: z.string().optional(),
  eventName: z.string().optional(),
  organizerName: z.string().optional(),
  date: z.string().min(1, { message: 'التاريخ مطلوب' }),
  location: z.string().min(1, { message: 'المكان مطلوب' }),
  tone: z.enum(['formal', 'casual', 'elegant']).optional(),
  language: z.enum(['ar', 'en']).optional(),
});

export const InvitationImageSchema = z.object({
  eventType: z.string().optional(),
  organizerName: z.string().optional(),
  themeColor: z.string().optional(),
  style: z.enum(['modern', 'classic', 'minimal']).optional(),
});

// ============================================
// Validation Helper Functions
// ============================================

/**
 * دالة تحقق عامة (متزامنة)
 */
export const validateData = <T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: boolean; data?: T; error?: string } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError && error.issues) {
      const errorMessage = (error.issues || [])
        .map((err: z.ZodIssue) => {
          const path = err.path && err.path.length > 0 ? err.path.join('.') + ': ' : '';
          return `${path}${err.message}`;
        })
        .join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'فشل التحقق من البيانات' };
  }
};

/**
 * دالة تحقق عامة (غير متزامنة)
 */
export async function validateInput<T>(
  schema: z.ZodSchema,
  data: unknown
): Promise<{ success: boolean; data?: T; errors?: Record<string, string[]> }> {
  try {
    const validated = await schema.parseAsync(data);
    return { success: true, data: validated as T };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string[]> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        if (!errors[path]) {
          errors[path] = [];
        }
        errors[path].push(err.message);
      });
      return { success: false, errors };
    }
    return {
      success: false,
      errors: { general: ['خطأ في المعالجة'] },
    };
  }
}

// ============================================
// Safe Parsing Functions
// ============================================

export async function safeParseLogin(data: unknown) {
  return validateInput<LoginInput>(LoginSchema, data);
}

export async function safeParsePINVerification(data: unknown) {
  return validateInput<PINVerificationInput>(PINVerificationSchema, data);
}

export async function safeParseEventCreate(data: unknown) {
  return validateInput<EventCreateInput>(EventCreateSchema, data);
}

export async function safeParseGuestAdd(data: unknown) {
  return validateInput<GuestAddInput>(GuestAddSchema, data);
}

export async function safeParseEmail(data: unknown) {
  return validateInput<EmailInput>(EmailSchema, data);
}

export async function safeParseBatchImport(data: unknown) {
  return validateInput<BatchImportInput>(BatchImportSchema, data);
}
