ملخص مشروع منصة "مِراس" (Meras Platform Context)

1\. نبذة عن المشروع (Project Overview)

الاسم: مِراس (Meras Platform). الوصف: منصة SaaS لإدارة الفعاليات (حفلات زفاف، مؤتمرات أعمال) تركز على السرعة، الأتمتة، وتجربة المستخدم الفاخرة. تتيح للمنظمين إنشاء روابط دعوة، إدارة المدعوين، ومسح التذاكر (QR) لحظياً.



2\. التقنيات المستخدمة (Tech Stack)

Frontend: Next.js 15 (App Router), React, TypeScript.



Styling: Tailwind CSS (Custom Dark Theme: #0A0A0C, #18181B, Gold #C19D65).



Backend \& DB: Supabase (PostgreSQL, Auth, Realtime).



Icons: Lucide React.



Key Libraries: qrcode.react (توليد الباركود), html-to-image (تحميل التذكرة).



3\. هيكلة قاعدة البيانات (Database Schema Concept)

Table: events



id (UUID), name, date, location\_name, type (wedding/business), pin\_code (للماسح).



Table: attendees



id (UUID - يُستخدم كـ Ticket ID), event\_id (FK), name, phone, email.



status (confirmed, declined, pending).



attended (Boolean - للدخول).



category (VIP, FAMILY, GENERAL).



updated\_at (يُستخدم كـ Timestamp لوقت الدخول).



4\. خريطة الصفحات والمسارات (Routing \& Features)

أ. صفحة التسجيل (/register/\[id])



تصميم متجاوب، يدعم RTL.



التحقق من صحة المدخلات (Validation).



دعم أرقام الجوال الخليجية مع الكود الدولي (مفتاح الدولة يسار، الرقم يمين).



Log: عند النجاح، يتم توجيه المستخدم تلقائياً لصفحة التذكرة (router.push).



ب. صفحة التذكرة (/t/\[id])



تعرض بطاقة التذكرة بتصميم CSS متقدم (Gradient, Noise Texture).



تتغير الألوان حسب نوع الفعالية (ذهبي للأفراح، أزرق للأعمال).



المميزات:



توليد QR Code عالي التباين (High Contrast).



زر "حفظ الصورة" (Download PNG) بجودة عالية.



أزرار تفاعلية (موقع الحفل، إضافة للتقويم).



ج. لوحة التحكم (/dashboard/events/\[id])



Real-time: تستمع لتحديثات Supabase لعرض الأرقام لحظياً.



الإحصائيات: رسوم بيانية (Donut Charts) للحضور، التأكيد، والنسبة.



جدول المدعوين الذكي:



بحث وفلترة (Tabs: الكل، حاضر، مؤكد).



إجراءات جماعية (Bulk Delete) مع Checkboxes.



إضافة يدوية سريعة (Modal).



تصدير البيانات (Excel/CSV).



عرض وقت الدخول الفعلي (Timestamp).



أدوات الإدارة:



نسخ رابط الدعوة ورابط الماسح (مع PIN).



واجهة أتمتة واتساب (تخصيص رسائل التذكير).



إدارة المضيفين (Co-Hosts UI).



د. الماسح الضوئي (/scan/\[id]) \[ملاحظة للذكاء الاصطناعي: هذه الصفحة ضمن المخطط]



تستخدم كاميرا الجوال لقراءة الـ QR.



تتصل بـ Supabase لتغيير حالة attended إلى true.



تعطي تغذية راجعة صوتية/بصرية (شاشة خضراء/حمراء).



5\. قواعد التصميم والهوية (Design Guidelines)

الخلفية: داكنة جداً (bg-\[#0A0A0C]) لتقليل استهلاك البطارية وإعطاء فخامة.



البطاقات: bg-\[#18181B] مع حدود خفيفة border-white/10.



الألوان: الذهبي (#C19D65) هو اللون الأساسي للأفراح والأزرار الرئيسية.



التجاوب: Mobile-First (كل شيء يجب أن يعمل على شاشة الجوال أولاً)

