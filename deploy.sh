#!/bin/bash
# دليل النشر السريع على Vercel

echo "🚀 مرحباً بك في نشر Meras Events على Vercel"
echo "================================================"
echo ""

# التحقق من npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm غير مثبت. يرجى تثبيت Node.js أولاً"
    exit 1
fi

echo "✅ npm موجود"

# التحقق من Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo ""
    echo "📦 تثبيت Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI موجود"
echo ""

echo "🔐 تسجيل الدخول إلى Vercel..."
vercel login

echo ""
echo "📁 نشر المشروع..."
vercel

echo ""
echo "⚠️  الخطوة التالية المهمة:"
echo "1. اذهب إلى https://vercel.com/dashboard"
echo "2. افتح مشروعك"
echo "3. اذهب إلى Settings → Environment Variables"
echo "4. أضف المتغيرات التالية:"
echo ""
echo "   NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co"
echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY = your-anon-key"
echo ""
echo "5. اضغط Save"
echo "6. عد للـ Deployments وانقر Redeploy على أحدث نشر"
echo ""
echo "✅ تم! موقعك الآن مباشر على الإنترنت!"
