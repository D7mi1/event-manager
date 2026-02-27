@echo off
REM دليل النشر السريع على Vercel (Windows)

echo.
echo 🚀 مرحباً بك في نشر Meras Events على Vercel
echo ================================================
echo.

REM التحقق من npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ npm غير مثبت. يرجى تثبيت Node.js أولاً
    pause
    exit /b 1
)

echo ✅ npm موجود
echo.

REM التحقق من Vercel CLI
where vercel >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📦 تثبيت Vercel CLI...
    call npm install -g vercel
)

echo ✅ Vercel CLI موجود
echo.

echo 🔐 تسجيل الدخول إلى Vercel...
call vercel login

echo.
echo 📁 نشر المشروع...
call vercel

echo.
echo ⚠️  الخطوة التالية المهمة:
echo 1. اذهب إلى https://vercel.com/dashboard
echo 2. افتح مشروعك
echo 3. اذهب إلى Settings → Environment Variables
echo 4. أضف المتغيرات التالية:
echo.
echo    NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
echo    NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key
echo.
echo 5. اضغط Save
echo 6. عد للـ Deployments وانقر Redeploy على أحدث نشر
echo.
echo ✅ تم! موقعك الآن مباشر على الإنترنت!
echo.
pause
