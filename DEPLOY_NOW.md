# 🎯 اختصار: كيف تنشر على Vercel الآن

## 3 خطوات فقط:

### 1️⃣ اذهب إلى Vercel
https://vercel.com/new

### 2️⃣ اختر GitHub Project
اختر `event-manager` وانقر **Deploy**

### 3️⃣ أضف متغيرات البيئة
في Vercel Dashboard:
- **Settings** → **Environment Variables**
- أضف هذين الاثنين من Supabase:
  ```
  NEXT_PUBLIC_SUPABASE_URL = https://...
  NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...
  ```
- اضغط **Save**
- عد للـ **Deployments**
- انقر **Redeploy** على أحدث نشر

✅ **تم! موقعك حي الآن!** 🚀

---

## أين أجد Supabase Keys؟

1. اذهب إلى supabase.com/dashboard
2. افتح مشروعك
3. اذهب إلى **Settings** → **API**
4. انسخ:
   - `Project URL`
   - `Anon Key`
5. ألصقهما في Vercel

---

## من الآن فصاعداً:

```bash
git push origin main
# → Vercel ينشر تلقائياً ✨
```

---

## 📍 موقعك الجديد:
`https://event-manager-xxx.vercel.app`

**استمتع!** 🎉
