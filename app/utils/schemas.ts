/**
 * Zod Schemas for Data Validation
 * دوال التحقق من البيانات باستخدام Zod
 */

import { z } from 'zod';

// Phone number schema with flexible validation
export const phoneSchema = z
  .string()
  .min(1, 'رقم الهاتف مطلوب')
  .regex(/^\d+$/, 'رقم الهاتف يجب أن يحتوي على أرقام فقط')
  .refine((phone) => phone.length >= 8, {
    message: 'رقم الهاتف يجب أن يكون على الأقل 8 أرقام',
  });

// Email schema
export const emailSchema = z
  .string()
  .email('صيغة البريد الإلكتروني غير صحيحة')
  .min(1, 'البريد الإلكتروني مطلوب');

// Name schema
export const nameSchema = z
  .string()
  .min(3, 'الاسم يجب أن يكون على الأقل 3 أحرف')
  .max(100, 'الاسم يجب أن يكون أقل من 100 حرف');

// Registration form schema
export const registrationSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  eventId: z.string().uuid('معرف الفعالية غير صحيح'),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

// Memory message schema
export const memorySchema = z.object({
  message: z
    .string()
    .min(1, 'الذكرى مطلوبة')
    .max(500, 'الذكرى طويلة جداً (الحد الأقصى 500 حرف)'),
  eventId: z.string().uuid('معرف الفعالية غير صحيح'),
  attendeeId: z.string().uuid('معرف الضيف غير صحيح'),
});

export type MemoryData = z.infer<typeof memorySchema>;

// Regret reason schema
export const regretSchema = z.object({
  reason: z
    .string()
    .max(500, 'السبب طويل جداً (الحد الأقصى 500 حرف)')
    .optional(),
  attendeeId: z.string().uuid('معرف الضيف غير صحيح'),
});

export type RegretData = z.infer<typeof regretSchema>;

// Event schema
export const eventSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'اسم الفعالية مطلوب'),
  date: z.string().datetime('التاريخ غير صحيح'),
  location_name: z.string().min(1, 'الموقع مطلوب'),
  type: z.enum(['business', 'wedding', 'other']),
  user_id: z.string().optional(),
  status: z.enum(['active', 'draft']).optional(),
  guests_count: z.number().optional(),
  is_registration_open: z.boolean().optional(),
});

export type EventData = z.infer<typeof eventSchema>;

// Attendee schema
export const attendeeSchema = z.object({
  id: z.string().uuid(),
  event_id: z.string().uuid(),
  name: z.string(),
  email: z.string().email(),
  phone: z.string(),
  status: z.enum(['pending', 'confirmed', 'declined']),
  created_at: z.string().datetime(),
  check_in_time: z.string().datetime().nullable().optional(),
  attended: z.boolean().optional(),
  regret_reason: z.string().optional(),
});

export type AttendeeData = z.infer<typeof attendeeSchema>;

// Validation helper function
export const validateData = <T>(schema: z.ZodSchema<T>, data: unknown): { success: boolean; data?: T; error?: string } => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError && error.issues) {
      const errorMessage = (error.issues || [])
        .map((err: any) => {
          const path = err.path && err.path.length > 0 ? err.path.join('.') + ': ' : '';
          return `${path}${err.message}`;
        })
        .join(', ');
      return { success: false, error: errorMessage };
    }
    return { success: false, error: 'فشل التحقق من البيانات' };
  }
};
