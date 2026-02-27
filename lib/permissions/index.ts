/**
 * نظام الصلاحيات - Permission System
 * =====================================
 * يحدد الأدوار والصلاحيات لكل مستخدم بالنسبة لفعالية معينة
 *
 * الأدوار:
 * - owner: منظم الفعالية (كل الصلاحيات)
 * - scanner: فريق الاستقبال (فحص التذاكر فقط)
 * - viewer: مشاهد (قراءة فقط)
 */

// ——— الأدوار المتاحة ———
export type Role = 'owner' | 'scanner' | 'viewer';

// ——— الصلاحيات المتاحة ———
export type Permission =
  | 'event:read'
  | 'event:edit'
  | 'event:delete'
  | 'guests:read'
  | 'guests:add'
  | 'guests:edit'
  | 'guests:delete'
  | 'guests:export'
  | 'tickets:scan'
  | 'tickets:read'
  | 'messages:send'
  | 'messages:config'
  | 'settings:edit'
  | 'design:edit'
  | 'seating:edit'
  | 'links:manage';

// ——— خريطة الصلاحيات لكل دور ———
const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  owner: [
    'event:read',
    'event:edit',
    'event:delete',
    'guests:read',
    'guests:add',
    'guests:edit',
    'guests:delete',
    'guests:export',
    'tickets:scan',
    'tickets:read',
    'messages:send',
    'messages:config',
    'settings:edit',
    'design:edit',
    'seating:edit',
    'links:manage',
  ],
  scanner: [
    'event:read',
    'guests:read',
    'tickets:scan',
    'tickets:read',
  ],
  viewer: [
    'event:read',
    'guests:read',
    'tickets:read',
  ],
};

/**
 * التحقق من صلاحية معينة لدور معين
 */
export function hasPermission(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * جلب جميع صلاحيات دور معين
 */
export function getRolePermissions(role: Role): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * التحقق من عدة صلاحيات (يجب أن تتوفر جميعها)
 */
export function hasAllPermissions(role: Role, permissions: Permission[]): boolean {
  return permissions.every((p) => hasPermission(role, p));
}

/**
 * التحقق من عدة صلاحيات (يكفي أن تتوفر واحدة)
 */
export function hasAnyPermission(role: Role, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(role, p));
}
