'use client'

import { type ReactNode } from 'react'
import { QueryProvider } from './query-provider'
import { AuthProvider } from '@/lib/contexts/auth-context'
import { Toaster } from '@/components/ui/sonner'

/**
 * مجمّع Providers المركزي
 * يلف التطبيق بجميع الـ Providers المطلوبة
 *
 * الترتيب مهم:
 * 1. QueryProvider - لإدارة الكاش والبيانات
 * 2. AuthProvider - لحالة المصادقة (يعتمد على QueryProvider لبعض الـ hooks)
 * 3. Toaster - لعرض إشعارات Toast في كل التطبيق
 */
export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        {children}
        <Toaster position="top-center" dir="rtl" />
      </AuthProvider>
    </QueryProvider>
  )
}
