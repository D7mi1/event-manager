/**
 * 🔐 Environment Variables Validation
 * التحقق من متغيرات البيئة المطلوبة
 */

/**
 * التحقق من المتغيرات المطلوبة
 * يُستدعى عند بدء التطبيق
 */
export function validateEnv() {
  // متغيرات مطلوبة دائماً
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  ];

  // متغيرات اختيارية مع تحذيرات (مطلوبة في الإنتاج لكن لن توقف البناء)
  const recommended = [
    'NEXT_PUBLIC_APP_URL',
    'NEXT_PUBLIC_BASE_URL',
    'RESEND_API_KEY',
    'HUGGINGFACE_API_KEY',
    'NEXT_PUBLIC_SENTRY_DSN',
    'SUPABASE_SERVICE_ROLE_KEY',
  ];

  const missing: string[] = [];
  const warnings: string[] = [];

  for (const variable of required) {
    if (!process.env[variable]) {
      missing.push(variable);
    }
  }

  // فحص المتغيرات الموصى بها (تحذير فقط، لا توقف البناء)
  for (const variable of recommended) {
    if (!process.env[variable]) {
      warnings.push(variable);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `❌ متغيرات البيئة المطلوبة غير موجودة: ${missing.join(', ')}\n` +
      `⚠️ تحقق من ملف .env.local\n` +
      `📄 يجب أن يحتوي على:\n` +
      missing.map(v => `   ${v}=your_value`).join('\n')
    );
  }

  if (warnings.length > 0) {
    console.warn(`⚠️ متغيرات بيئة موصى بها غير موجودة: ${warnings.join(', ')}`);
  }

  console.log('✅ جميع متغيرات البيئة صحيحة');
}

/**
 * التحقق من عدم تعريض الـ Secrets
 * تأكد من عدم وجود NEXT_PUBLIC_* على مفاتيح سرية
 */
export function checkPublicVars() {
  const exposedSecrets = [
    'NEXT_PUBLIC_SUPABASE_SERVICE_KEY',
    'NEXT_PUBLIC_DATABASE_PASSWORD',
    'NEXT_PUBLIC_STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_JWT_SECRET',
    'NEXT_PUBLIC_RESEND_API_KEY',
    'NEXT_PUBLIC_HUGGINGFACE_API_KEY',
  ];

  const exposed: string[] = [];

  for (const variable of exposedSecrets) {
    if (process.env[variable]) {
      exposed.push(variable);
    }
  }

  if (exposed.length > 0) {
    throw new Error(
      `⚠️ تحذير: مفاتيح سرية معرّضة كـ NEXT_PUBLIC: ${exposed.join(', ')}\n` +
      `❌ أزل NEXT_PUBLIC_ من المفاتيح السرية!\n` +
      `الـ NEXT_PUBLIC_* يجب أن تكون للبيانات العامة فقط`
    );
  }

  console.log('✅ لا توجد مفاتيح سرية معرّضة');
}

/**
 * التحقق الشامل من البيئة
 */
export function validateEnvironment() {
  if (typeof window !== 'undefined') {
    // لا تشغّل هذا في الـ browser
    return;
  }

  try {
    validateEnv();
    checkPublicVars();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
