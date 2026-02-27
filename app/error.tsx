'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle } from 'lucide-react';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div
      className="min-h-screen bg-[#0A0A0C] flex items-center justify-center p-4"
      dir="rtl"
    >
      <div className="w-full max-w-md bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white">حدث خطأ ما</h2>
          <p className="text-white/50 text-sm leading-relaxed">
            {error.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.'}
          </p>
          {error.digest && (
            <p className="text-white/30 text-xs font-mono mt-2">
              معرف الخطأ: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl transition-colors duration-200"
          >
            حاول مرة أخرى
          </button>
          <Link
            href="/"
            className="w-full px-6 py-3 bg-white/5 hover:bg-white/10 text-white/70 font-bold text-sm rounded-xl transition-colors duration-200 block"
          >
            العودة للرئيسية
          </Link>
        </div>
      </div>
    </div>
  );
}
