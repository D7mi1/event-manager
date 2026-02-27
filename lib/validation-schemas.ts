/**
 * @deprecated تم نقل جميع المخططات إلى lib/schemas.ts
 * هذا الملف يعيد التصدير للتوافق - سيُحذف لاحقاً
 */
export {
  LoginSchema,
  type LoginInput,
  PINVerificationSchema,
  type PINVerificationInput,
  EventCreateSchema,
  type EventCreateInput,
  EventUpdateSchema,
  type EventUpdateInput,
  GuestAddSchema,
  type GuestAddInput,
  EmailSchema,
  type EmailInput,
  BatchImportSchema,
  type BatchImportInput,
  validateInput,
  safeParseLogin,
  safeParsePINVerification,
  safeParseEventCreate,
  safeParseGuestAdd,
  safeParseEmail,
  safeParseBatchImport,
  isStrongPassword,
} from '@/lib/schemas';
