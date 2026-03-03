'use client'

import { type ReactNode } from 'react'
import { QueryProvider } from './query-provider'
import { AuthProvider } from '@/lib/contexts/auth-context'
import { PostHogProvider } from './posthog-provider'
import { Toaster } from '@/components/ui/sonner'

/**
 * مجمّع Providers المركزي
 * يلف التطبيق بجميع الـ Providers المطلوبة
 *
 * الترتيب مهم:
 * 1. PostHogProvider - تحليلات (يحتاج يكون فوق عشان يتتبع كل شي)
 * 2. QueryProvider - لإدارة الكاش والبيانات
 * 3. AuthProvider - لحالة المصادقة (يعتمد على QueryProvider لبعض الـ hooks)
 * 4. Toaster - لعرض إشعارات Toast في كل التطبيق
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <PostHogProvider>
      <QueryProvider>
        <AuthProvider>
          {children}
          <Toaster position="top-center" dir="rtl" />
        </AuthProvider>
      </QueryProvider>
    </PostHogProvider>
  )
}
