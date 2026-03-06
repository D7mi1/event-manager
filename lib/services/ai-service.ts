'use server';

import { HfInference } from '@huggingface/inference';

import { createClient } from '@/lib/supabase/server';
import { InvitationTextSchema, InvitationImageSchema } from '@/lib/schemas';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

// ============================================
// أنواع الفعاليات
// ============================================

type EventCategory = 'wedding' | 'graduation' | 'social' | 'business';

function detectEventCategory(eventType?: string): EventCategory {
  if (!eventType) return 'business';
  const t = eventType.toLowerCase();

  if (['wedding', 'زواج', 'زفاف', 'ملكة', 'عرس'].some(k => t.includes(k))) return 'wedding';
  if (['graduation', 'تخرج', 'تخرّج'].some(k => t.includes(k))) return 'graduation';
  if (['social', 'عشاء', 'عزيمة', 'حفلة', 'عيد', 'استقبال', 'مولود'].some(k => t.includes(k))) return 'social';

  return 'business';
}

// ============================================
// توليد نص الدعوة (مع دعم أنواع الفعاليات)
// ============================================

export async function generateInvitationText(params: {
  eventType?: string;
  eventName?: string;
  organizerName?: string;
  date: string;
  location: string;
  tone?: 'formal' | 'casual' | 'elegant';
  language?: 'ar' | 'en';
  // حقول المناسبات الاجتماعية
  groomName?: string;
  brideName?: string;
  groomFatherName?: string;
  brideFatherName?: string;
  graduateName?: string;
  institutionName?: string;
}): Promise<string> {
  // 0. التحقق من المصادقة (Auth Check)
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    throw new Error('Unauthorized: Must be logged in to generate invitation text');
  }

  // 1. التحقق من المدخلات (Validation)
  const validatedParams = InvitationTextSchema.safeParse(params);
  if (!validatedParams.success) {
    throw new Error(`Validation Error: ${validatedParams.error.issues[0].message}`);
  }

  const category = detectEventCategory(params.eventType);
  const prompt = buildPrompt(category, params);

  try {
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 300,
        temperature: 0.8,
        top_p: 0.95,
        repetition_penalty: 1.3,
        return_full_text: false
      }
    });

    let text = response.generated_text.trim();
    text = text.replace(/^(النص:|Text:)/i, '').trim();

    return text || getFallbackText(category, params);
  } catch (error) {
    console.error('AI Text Generation Error:', error);
    return getFallbackText(category, params);
  }
}

// ============================================
// بناء Prompt حسب نوع الفعالية
// ============================================

function buildPrompt(category: EventCategory, params: any): string {
  const { eventName, organizerName, date, location, tone,
    groomName, brideName, groomFatherName, brideFatherName,
    graduateName, institutionName } = params;

  const toneDesc = tone === 'casual' ? 'ودي وقريب' : tone === 'elegant' ? 'راقي واحترافي' : 'رسمي';

  switch (category) {
    case 'wedding':
      return `اكتب نص دعوة زواج سعودية باللغة العربية:

اسم العريس: ${groomName || 'العريس'}
والد العريس: ${groomFatherName || ''}
اسم العروس: ${brideName || 'العروس'}
والد العروس: ${brideFatherName || ''}
التاريخ: ${date}
المكان: ${location}

المطلوب:
- ابدأ بالبسملة "بسم الله الرحمن الرحيم"
- ثم آية أو حديث عن الزواج
- أسلوب ${toneDesc} وإسلامي رسمي
- استخدم رموز زخرفية: ✦ ❖ ◆ ✧
- 6-10 أسطر
- اذكر اسم العريس والعروس وعائلاتهم
- ختام بدعاء للعروسين

النص:`;

    case 'graduation':
      return `اكتب نص دعوة حفل تخرج باللغة العربية:

اسم الخريج/ة: ${graduateName || eventName || 'الخريج'}
الجهة التعليمية: ${institutionName || ''}
التاريخ: ${date}
المكان: ${location}
${organizerName ? `المنظم: ${organizerName}` : ''}

المطلوب:
- أسلوب ${toneDesc} تهنئة واحتفالي
- استخدم رموز: 🎓 ✦ ❖ ◆
- 5-7 أسطر
- تهنئة بالتخرج والإنجاز
- دعوة لمشاركة الفرحة

النص:`;

    case 'social':
      return `اكتب نص دعوة لمناسبة اجتماعية باللغة العربية:

نوع المناسبة: ${params.eventType || 'حفلة'}
اسم المناسبة: ${eventName || 'مناسبة'}
${organizerName ? `المنظم: ${organizerName}` : ''}
التاريخ: ${date}
المكان: ${location}

المطلوب:
- أسلوب ${toneDesc} ودافئ
- استخدم رموز: ✦ ❖ ✧ 🌟
- 5-7 أسطر
- لغة عربية سلسة
- ترحيب حار

النص:`;

    default: // business
      return `اكتب نص دعوة لفعالية أعمال باللغة العربية:

نوع الفعالية: ${params.eventType || 'مؤتمر'}
اسم الفعالية: ${eventName || 'فعالية'}
الجهة المنظمة: ${organizerName || ''}
التاريخ: ${date}
المكان: ${location}

المطلوب:
- أسلوب ${toneDesc}
- استخدم رموز زخرفية: ✦ ❖ ◆ ✧
- 5-7 أسطر فقط
- لغة عربية فصحى احترافية
- تناسب قطاع الأعمال والمؤتمرات

النص:`;
  }
}

// ============================================
// النصوص الاحتياطية (Fallback Templates)
// ============================================

function getFallbackText(category: EventCategory, params: any): string {
  const { eventName, organizerName, date, location,
    groomName, brideName, groomFatherName, brideFatherName,
    graduateName, institutionName } = params;

  const formattedDate = new Date(date).toLocaleDateString('ar-SA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  switch (category) {
    case 'wedding':
      return `بسم الله الرحمن الرحيم

✦ ❖ ◆ ✧ ❖ ◆ ✧ ✦

"ومن آياته أن خلق لكم من أنفسكم أزواجاً لتسكنوا إليها"

يتشرف
${groomFatherName ? `${groomFatherName} وعائلته` : 'أسرة العريس'}
و
${brideFatherName ? `${brideFatherName} وعائلته` : 'أسرة العروس'}

بدعوتكم لحضور حفل زواج ابنهما

★ ${groomName || 'العريس'} ✦ ${brideName || 'العروس'} ★

📅 ${formattedDate}
📍 ${location}

✧ بارك الله لهما وبارك عليهما وجمع بينهما في خير ✧`;

    case 'graduation':
      return `✦ دعوة حضور حفل تخرج 🎓 ✦

❖ ◆ ✧ ❖ ◆ ✧

مبارك التخرج والنجاح!

يسعدنا دعوتكم لمشاركتنا فرحة تخرج

★ ${graduateName || eventName || 'الخريج'} ★

${institutionName ? `من ${institutionName}` : ''}
${organizerName ? `تنظيم: ${organizerName}` : ''}

📅 ${formattedDate}
📍 ${location}

✧ شاركونا الفرحة ✧`;

    case 'social':
      return `✦ دعوة حضور ✦

❖ ◆ ✧ ❖ ◆ ✧

يسعدنا ويسرنا دعوتكم لحضور

★ ${eventName || 'المناسبة'} ★

${organizerName ? `من: ${organizerName}` : ''}

📅 ${formattedDate}
📍 ${location}

✧ حياكم الله ✧`;

    default: // business
      return `✦ دعوة حضور ✦

❖ ◆ ✧ ❖ ◆ ✧

يسعدنا ويشرفنا دعوتكم الكريمة
لحضور

★ ${eventName || 'الفعالية'} ★

${organizerName ? `تنظيم: ${organizerName}` : ''}

📅 التاريخ: ${formattedDate}
📍 المكان: ${location}

✧ نتطلع لمشاركتكم ✧`;
  }
}

// ============================================
// توليد صورة الدعوة
// ============================================

export async function generateInvitationImage(params: {
  eventType?: string;
  organizerName?: string;
  themeColor?: string;
  style?: 'modern' | 'classic' | 'minimal';
}): Promise<string> {
  // 0. التحقق من المصادقة (Auth Check)
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    throw new Error('Unauthorized: Must be logged in to generate invitation image');
  }

  // 1. التحقق من المدخلات (Validation)
  const validatedParams = InvitationImageSchema.safeParse(params);
  if (!validatedParams.success) {
    throw new Error(`Validation Error: ${validatedParams.error.issues[0].message}`);
  }

  const { themeColor = 'blue and white', style = 'modern' } = params;
  const category = detectEventCategory(params.eventType);

  // اختيار prompts حسب نوع الفعالية
  const prompts = getImagePrompts(category, themeColor);
  const prompt = prompts[style || 'modern'] || prompts['modern'];

  try {
    const blob = await hf.textToImage({
      model: 'stabilityai/stable-diffusion-xl-base-1.0',
      inputs: prompt,
      parameters: {
        negative_prompt: 'ugly, blurry, low quality, distorted, text, watermark, signature, faces, people',
        num_inference_steps: 30,
        guidance_scale: 7.5,
      }
    });

    // Handle both Blob and string responses
    let base64: string;
    if (blob && typeof blob === 'object' && 'arrayBuffer' in blob) {
      const buffer = await (blob as any).arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      base64 = btoa(String.fromCharCode(...Array.from(uint8Array)));
    } else if (typeof blob === 'string') {
      if (blob.startsWith('data:') || blob.startsWith('http')) {
        return blob;
      }
      base64 = blob;
    } else {
      throw new Error('Unexpected response type from AI service');
    }

    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.error('AI Image Generation Error:', error);
    return getPlaceholderImage(themeColor, category);
  }
}

// ============================================
// Image Prompts حسب نوع الفعالية
// ============================================

function getImagePrompts(category: EventCategory, themeColor: string): Record<string, string> {
  switch (category) {
    case 'wedding':
      return {
        modern: `Luxurious modern wedding invitation card, elegant floral patterns, ${themeColor} and gold color palette, romantic aesthetic, clean typography space, premium quality, 8K`,
        classic: `Classic elegant wedding invitation, ornate Islamic geometric borders, ${themeColor} palette, luxury gold foil accents, traditional Arabic wedding card style, romantic roses`,
        minimal: `Minimalist wedding invitation card, clean white space, subtle ${themeColor} watercolor flowers, elegant serif typography space, romantic and simple design`,
      };
    case 'graduation':
      return {
        modern: `Modern graduation celebration invitation card, academic cap design elements, ${themeColor} palette, confetti accents, achievement themed, premium quality, 8K`,
        classic: `Classic graduation ceremony invitation, academic seal design, ${themeColor} palette, elegant borders, scholarly aesthetic, gold accents`,
        minimal: `Minimalist graduation party invitation card, clean design, subtle ${themeColor} accents, graduation cap icon, modern typography space`,
      };
    case 'social':
      return {
        modern: `Modern party invitation card, festive design elements, ${themeColor} palette, celebration aesthetic, elegant layout, premium quality, 8K`,
        classic: `Classic elegant event invitation, sophisticated design, ${themeColor} palette, ornate borders, warm festive feeling, gold accents`,
        minimal: `Minimalist social event invitation card, clean white space, subtle ${themeColor} accents, warm and inviting design, simple elegant`,
      };
    default: // business
      return {
        modern: `Professional modern business conference invitation card, clean geometric patterns, ${themeColor} color palette, corporate branding aesthetic, sleek typography space, tech-inspired design elements, premium quality, 8K quality`,
        classic: `Elegant classic business event invitation, sophisticated geometric borders, ${themeColor} palette, luxury corporate aesthetic, premium letterpress style, refined professional design, gold foil accents`,
        minimal: `Minimalist business event invitation card, clean white space, subtle ${themeColor} accents, modern sans-serif typography space, professional corporate aesthetic, simple elegant design`,
      };
  }
}

// ============================================
// Placeholder Image
// ============================================

function getPlaceholderImage(themeColor: string, category: EventCategory = 'business'): string {
  const colorMap: Record<EventCategory, string[]> = {
    wedding: ['#C19D65', '#8B6914'],
    graduation: ['#1E40AF', '#1E3A5F'],
    social: ['#7C3AED', '#4C1D95'],
    business: ['#3B82F6', '#1E3A5F'],
  };

  const labelMap: Record<EventCategory, string> = {
    wedding: 'دعوة زواج',
    graduation: 'حفل تخرج',
    social: 'دعوة حضور',
    business: 'دعوة حضور',
  };

  const colors = colorMap[category] || colorMap.business;
  const label = labelMap[category] || 'دعوة حضور';

  const svg = `<svg width="800" height="1000" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${colors[0]};stop-opacity:1" />
        <stop offset="100%" style="stop-color:${colors[1]};stop-opacity:1" />
      </linearGradient>
      <pattern id="pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
        <rect x="45" y="0" width="10" height="100" fill="white" opacity="0.05"/>
        <rect x="0" y="45" width="100" height="10" fill="white" opacity="0.05"/>
      </pattern>
    </defs>
    <rect width="800" height="1000" fill="url(#grad)"/>
    <rect width="800" height="1000" fill="url(#pattern)"/>
    <g transform="translate(400, 500)">
      <rect x="-150" y="-150" width="300" height="300" rx="20" fill="none" stroke="white" stroke-width="2" opacity="0.3"/>
      <rect x="-120" y="-120" width="240" height="240" rx="15" fill="none" stroke="white" stroke-width="1.5" opacity="0.4"/>
    </g>
    <text x="400" y="510" font-size="50" fill="white" text-anchor="middle" font-family="sans-serif" font-weight="700">${label}</text>
    <text x="400" y="560" font-size="24" fill="white" text-anchor="middle" font-family="sans-serif" opacity="0.8">${category === 'wedding' ? 'مبروك للعروسين' : category === 'graduation' ? 'مبارك التخرج' : 'فعالية'}</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// ============================================
// توليد تنويعات
// ============================================

export async function generateTextVariations(params: any): Promise<string[]> {
  const tones: Array<'formal' | 'elegant' | 'casual'> = ['elegant', 'formal', 'casual'];
  const variations = await Promise.all(
    tones.map(tone => generateInvitationText({ ...params, tone }))
  );
  return variations;
}

// ============================================
// تخصيص رسائل الواتساب (المرحلة 4)
// ============================================

export async function generatePersonalizedMessage(params: {
  guestName: string;
  guestCategory: 'GENERAL' | 'VIP' | 'FAMILY';
  eventType: string;
  eventName: string;
  eventDate: string;
  location?: string;
}): Promise<string> {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (!user || authError) {
    throw new Error('Unauthorized');
  }

  const { guestName, guestCategory, eventType, eventName, eventDate, location } = params;

  const categoryTone: Record<string, string> = {
    VIP: 'محترم جداً وتقديري — يخاطب الضيف كشخصية مهمة',
    FAMILY: 'عائلي دافئ ومحب — يخاطب الضيف كأحد أفراد العائلة',
    GENERAL: 'ودي ومرحّب — أسلوب عام لطيف',
  };

  const toneInstruction = categoryTone[guestCategory] || categoryTone.GENERAL;

  const prompt = `اكتب رسالة واتساب قصيرة (3-4 أسطر) باللغة العربية لدعوة ضيف:

اسم الضيف: ${guestName}
نوع الدعوة: ${eventType}
اسم الفعالية: ${eventName}
التاريخ: ${eventDate}
${location ? `المكان: ${location}` : ''}

الأسلوب المطلوب: ${toneInstruction}

اكتب الرسالة مباشرة بدون مقدمات:`;

  try {
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 150,
        temperature: 0.85,
        top_p: 0.95,
        repetition_penalty: 1.3,
        return_full_text: false,
      },
    });

    let text = response.generated_text.trim();
    text = text.replace(/^(الرسالة:|النص:)/i, '').trim();

    return text || getPersonalizedFallback(params);
  } catch (error) {
    console.error('AI Personalization Error:', error);
    return getPersonalizedFallback(params);
  }
}

function getPersonalizedFallback(params: {
  guestName: string;
  guestCategory: string;
  eventName: string;
  eventDate: string;
}): string {
  const { guestName, guestCategory, eventName, eventDate } = params;

  const formattedDate = new Date(eventDate).toLocaleDateString('ar-SA', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  switch (guestCategory) {
    case 'VIP':
      return `حياك الله ${guestName} ✨\n\nيشرّفنا حضوركم الكريم في:\n${eventName}\n${formattedDate}\n\nننتظركم بكل شوق 🌟`;
    case 'FAMILY':
      return `أهلاً وسهلاً ${guestName} 💛\n\nما يكمل فرحتنا إلا وجودكم معنا:\n${eventName}\n${formattedDate}\n\nحياكم الله ❤️`;
    default:
      return `مرحباً ${guestName} 👋\n\nيسعدنا دعوتكم لحضور:\n${eventName}\n${formattedDate}\n\nنتطلع لرؤيتكم ✨`;
  }
}
