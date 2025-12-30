/**
 * Constants and Configuration
 */

// Get the app URL from environment or use window location
export const APP_URL = 
  process.env.NEXT_PUBLIC_APP_URL || 
  (typeof window !== 'undefined' ? window.location.origin : 'https://meras.app');

// API Configuration
export const API_CONFIG = {
  timeout: 10000, // 10 seconds
  retries: 3,
};

// Status Types
export const STATUS_TYPES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DECLINED: 'declined',
} as const;

// Event Types
export const EVENT_TYPES = {
  WEDDING: 'wedding',
  BUSINESS: 'business',
  OTHER: 'other',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'حدث خطأ غير متوقع',
  NETWORK: 'خطأ في الاتصال بالإنترنت',
  NOT_FOUND: 'لم يتم العثور على الموارد المطلوبة',
  UNAUTHORIZED: 'غير مصرح بالوصول',
  VALIDATION: 'بيانات غير صحيحة',
} as const;
