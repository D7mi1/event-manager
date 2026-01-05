import { NextResponse } from 'next/server';
import { captureError } from './sentry';

export function handleApiError(error: any, context?: string) {
  // تسجيل الخطأ في Sentry
  captureError(error, { context });

  // رسالة عامة للمستخدم (لا تكشف تفاصيل)
  const userMessage = 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.';

  // في Development، اعرض التفاصيل
  if (process.env.NODE_ENV === 'development') {
    console.error(`[API Error - ${context}]:`, error);
    return NextResponse.json(
      { 
        error: userMessage,
        details: error.message, // فقط في Dev
        stack: error.stack
      },
      { status: 500 }
    );
  }

  // في Production، لا تكشف تفاصيل
  return NextResponse.json(
    { error: userMessage },
    { status: 500 }
  );
}
