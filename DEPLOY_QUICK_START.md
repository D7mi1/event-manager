# 🚀 نشر Meras على Vercel (خطوات سريعة جداً)

## ⚡ الخيار 1: النشر بسهولة (مع Git Integration)

### الخطوة 1️⃣
1. اذهب إلى https://vercel.com/new
2. اختر `event-manager` من GitHub
3. اضغط **Deploy**

### الخطوة 2️⃣
انسخ معلومات Supabase:
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

### الخطوة 3️⃣
في Vercel Dashboard:
- Settings → Environment Variables
- أضف المتغيرات
- Save
- عد للـ Deployments وانقر **Redeploy**

✅ **تم! موقعك مباشر** 🎉

---

## ⚡ الخيار 2: النشر عبر CLI (المتقدم)

```bash
# على Windows
./deploy.bat

# على Mac/Linux
bash deploy.sh
```

---

## 📊 الحالة

- ✅ الكود جاهز على GitHub
- ✅ Vercel مُعدة
- ✅ البناء ناجح
- ✅ لا أخطاء
- ⏳ **الآن: أضف متغيرات البيئة فقط!**

---

## 🔗 الروابط المهمة

- **GitHub**: https://github.com/D7mi1/event-manager
- **Vercel**: https://vercel.com
- **Supabase**: https://supabase.com
- **دليل كامل**: [VERCEL_GUIDE_AR.md](./VERCEL_GUIDE_AR.md)

---

## 📞 الدعم

اضغط على المشكلة التي تواجهها:

- [❌ النشر فشل](./VERCEL_GUIDE_AR.md#%D8%A3%D8%AE%D8%B7%D8%A7%D8%A1)
- [❓ أين أجد Supabase Keys؟](./VERCEL_GUIDE_AR.md#%D8%A7%D9%84%D8%AE%D8%B7%D9%88%D8%A9-1-%D8%AA%D8%B3%D8%AC%D9%8A%D9%84-%D8%A7%D9%84%D8%AF%D8%AE%D9%88%D9%84-%D8%A5%D9%84%D9%89-supabase)
- [🌐 إضافة نطاق خاص](./VERCEL_GUIDE_AR.md#-إضافة-النطاق-الخاص-بك-اختياري)

---

## 🎯 الخطوة التالية

```bash
# بعد نشر أول مرة، كل push إلى main سينشر تلقائياً:
git add .
git commit -m "update: new features"
git push origin main
# 🚀 Vercel ينشر تلقائياً!
```

**استمتع! 🎊**
