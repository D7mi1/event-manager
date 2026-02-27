import { NextResponse } from 'next/server';

/**
 * فئة معالجة الأخطاء المخصصة
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export type ErrorType =
  | 'VALIDATION_ERROR'
  | 'NOT_FOUND'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'CONFLICT'
  | 'RATE_LIMIT'
  | 'SERVER_ERROR';

/**
 * معالج شامل لأخطاء API
 */
export function handleApiError(error: unknown, context?: string) {
  console.error(`[API Error${context ? ` - ${context}` : ''}]:`, error);

  let status = 500;
  let message = 'حدث خطأ في الخادم';
  let code: ErrorType = 'SERVER_ERROR';
  let details: string | undefined;

  if (error instanceof ApiError) {
    status = error.status;
    message = error.message;
    code = error.code as ErrorType;
  } else if (error instanceof SyntaxError) {
    status = 400;
    message = 'صيغة البيانات غير صحيحة';
    code = 'VALIDATION_ERROR';
    details = error.message;
  } else if (error instanceof TypeError) {
    status = 400;
    message = 'بيانات غير صحيحة أو مفقودة';
    code = 'VALIDATION_ERROR';
    details = error.message;
  } else if (error instanceof RangeError) {
    status = 422;
    message = 'قيمة خارج النطاق المقبول';
    code = 'VALIDATION_ERROR';
    details = error.message;
  } else if (error instanceof Error) {
    details = error.message;

    if (error.message.includes('unique violation')) {
      status = 409;
      message = 'هذا العنصر موجود بالفعل';
      code = 'CONFLICT';
    } else if (error.message.includes('not found')) {
      status = 404;
      message = 'العنصر المطلوب غير موجود';
      code = 'NOT_FOUND';
    } else if (error.message.includes('permission denied')) {
      status = 403;
      message = 'ليس لديك صلاحية للقيام بهذا الإجراء';
      code = 'FORBIDDEN';
    }
  }

  const response: any = {
    error: message,
    code,
    ...(context && { context }),
  };

  if (process.env.NODE_ENV === 'development' && details) {
    response.details = details;
    if (error instanceof Error) {
      response.stack = error.stack;
    }
  }

  return NextResponse.json(response, { status });
}

export function notFoundError(message: string = 'العنصر المطلوب غير موجود') {
  return new ApiError(message, 404, 'NOT_FOUND');
}

export function validationError(message: string = 'بيانات غير صحيحة') {
  return new ApiError(message, 400, 'VALIDATION_ERROR');
}

export function unauthorizedError(message: string = 'يجب تسجيل الدخول') {
  return new ApiError(message, 401, 'UNAUTHORIZED');
}

export function forbiddenError(message: string = 'ليس لديك صلاحية') {
  return new ApiError(message, 403, 'FORBIDDEN');
}

export function conflictError(message: string = 'يوجد تضارب في البيانات') {
  return new ApiError(message, 409, 'CONFLICT');
}

export function rateLimitError(retryAfter?: number) {
  const response = NextResponse.json(
    { error: 'حد محاولات التوثيق تجاوز', code: 'RATE_LIMIT' },
    { status: 429 }
  );
  if (retryAfter) {
    response.headers.set('Retry-After', String(retryAfter));
  }
  return response;
}
