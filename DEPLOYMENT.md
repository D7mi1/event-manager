# 🚀 نشر التطبيق على Vercel

## الخطوات السريعة للنشر:

### **الخطوة 1: إعداد Vercel CLI**
```bash
npm install -g vercel
```

### **الخطوة 2: تسجيل الدخول إلى Vercel**
```bash
vercel login
```
سيفتح متصفح لتسجيل الدخول. استخدم حسابك على Vercel (أو انشئ واحداً جديداً).

### **الخطوة 3: نشر المشروع**
```bash
vercel
```

سيسأل عن:
- **Project name**: اختر اسماً (مثلاً: `meras-events`)
- **Framework**: Next.js (سيتم اكتشافه تلقائياً)
- **Root directory**: `. (كرينت)

### **الخطوة 4: إضافة متغيرات البيئة**

اذهب إلى https://vercel.com/dashboard وافتح مشروعك، ثم:

1. **Settings** → **Environment Variables**
2. أضف المتغيرات التالية:

```
NEXT_PUBLIC_SUPABASE_URL = https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGc...
NEXT_PUBLIC_SENTRY_DSN = https://xxx@sentry.io/yyy
```

3. اضغط **Save**

### **الخطوة 5: النشر الإنتاجي**
```bash
vercel --prod
```

---

## 📱 خطوات إضافية (اختيارية):

### **إذا كان لديك نطاق (Domain):**
1. في Vercel Dashboard → Project Settings → Domains
2. أضف نطاقك وأكمل التحقق من DNS

### **تفعيل Git Integration (التوصية):**
```bash
# ربط GitHub بـ Vercel
# اذهب إلى https://vercel.com/new وحدد مشروعك على GitHub
# ستتم عملية النشر تلقائياً عند كل push إلى main branch
```

### **المزايا:**
✅ نشر تلقائي عند تحديث GitHub  
✅ Preview deployments لكل Pull Request  
✅ CDN عالمي للسرعة العالية  
✅ قابلية الماسح الضوئي (Serverless Functions)  
✅ HTTPS تلقائياً  

---

## 🔧 استكشاف الأخطاء:

### إذا فشل البناء:
```bash
vercel logs
```

### لإعادة النشر:
```bash
vercel --prod --force
```

### للعودة إلى نسخة سابقة:
في Vercel Dashboard → Deployments → اختر النسخة القديمة → Promote to Production

---

## ✅ التحقق من الموقع:

بعد النشر الناجح، ستحصل على رابط مثل:
```
https://your-project.vercel.app
```

---

## 📧 دعم Vercel:

- **Docs**: https://vercel.com/docs
- **Support**: https://vercel.com/support
- **Community**: https://github.com/vercel/community
