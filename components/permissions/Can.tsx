'use client';

import { type ReactNode } from 'react';
import { hasPermission, hasAnyPermission, type Role, type Permission } from '@/lib/permissions';

/**
 * مكون <Can> - إخفاء/إظهار عناصر UI حسب الصلاحيات
 * =====================================================
 *
 * @example
 * ```tsx
 * // إظهار زر الحذف فقط لصاحب الفعالية
 * <Can role={userRole} permission="guests:delete">
 *   <button>حذف الضيف</button>
 * </Can>
 *
 * // إظهار عنصر بديل عند عدم وجود الصلاحية
 * <Can role={userRole} permission="event:edit" fallback={<p>ليس لديك صلاحية التعديل</p>}>
 *   <EditButton />
 * </Can>
 *
 * // التحقق من أي صلاحية من قائمة
 * <Can role={userRole} anyOf={['guests:add', 'guests:edit']}>
 *   <GuestForm />
 * </Can>
 * ```
 */
interface CanProps {
  /** دور المستخدم الحالي */
  role: Role;
  /** صلاحية واحدة مطلوبة */
  permission?: Permission;
  /** يكفي توفر أي صلاحية من القائمة */
  anyOf?: Permission[];
  /** المحتوى المعروض عند توفر الصلاحية */
  children: ReactNode;
  /** محتوى بديل عند عدم توفر الصلاحية */
  fallback?: ReactNode;
}

export function Can({ role, permission, anyOf, children, fallback = null }: CanProps) {
  let allowed = false;

  if (permission) {
    allowed = hasPermission(role, permission);
  } else if (anyOf && anyOf.length > 0) {
    allowed = hasAnyPermission(role, anyOf);
  }

  return allowed ? <>{children}</> : <>{fallback}</>;
}

/**
 * Hook بديل للاستخدام البرمجي
 *
 * @example
 * ```tsx
 * const canEdit = useCan('owner', 'event:edit');
 * if (canEdit) { ... }
 * ```
 */
export function useCan(role: Role, permission: Permission): boolean {
  return hasPermission(role, permission);
}
