'use server';

import { HfInference } from '@huggingface/inference';

import { createClient } from '@/app/utils/supabase/server';
import { InvitationTextSchema, InvitationImageSchema } from '@/lib/schemas';

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function generateInvitationText(params: {
  eventType?: string;
  eventName?: string;
  organizerName?: string;
  date: string;
  location: string;
  tone?: 'formal' | 'casual' | 'elegant';
  language?: 'ar' | 'en';
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

  const { eventName, organizerName, date, location, eventType, tone } = params;

  const toneDesc = tone === 'casual' ? 'ودي وقريب' : tone === 'elegant' ? 'راقي واحترافي' : 'رسمي';

  const prompt = `اكتب نص دعوة لفعالية أعمال باللغة العربية:

نوع الفعالية: ${eventType || 'مؤتمر'}
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

  try {
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: prompt,
      parameters: {
        max_new_tokens: 250,
        temperature: 0.8,
        top_p: 0.95,
        repetition_penalty: 1.3,
        return_full_text: false
      }
    });

    let text = response.generated_text.trim();
    text = text.replace(/^(النص:|Text:)/i, '').trim();

    return text || getFallbackText(params);
  } catch (error) {
    console.error('AI Text Generation Error:', error);
    return getFallbackText(params);
  }
}

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

  const prompts: Record<string, string> = {
    modern: `Professional modern business conference invitation card, clean geometric patterns, ${themeColor} color palette, corporate branding aesthetic, sleek typography space, tech-inspired design elements, premium quality, 8K quality`,

    classic: `Elegant classic business event invitation, sophisticated geometric borders, ${themeColor} palette, luxury corporate aesthetic, premium letterpress style, refined professional design, gold foil accents`,

    minimal: `Minimalist business event invitation card, clean white space, subtle ${themeColor} accents, modern sans-serif typography space, professional corporate aesthetic, simple elegant design`
  };

  const prompt = prompts[style] || prompts['modern'];

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
      // It's a Blob-like object
      const buffer = await (blob as any).arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      base64 = btoa(String.fromCharCode(...Array.from(uint8Array)));
    } else if (typeof blob === 'string') {
      // Already base64 or URL
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
    return getPlaceholderImage(themeColor);
  }
}

function getFallbackText(params: any): string {
  const { eventName, organizerName, date, location } = params;

  return `✦ دعوة حضور ✦

❖ ◆ ✧ ❖ ◆ ✧

يسعدنا ويشرفنا دعوتكم الكريمة
لحضور

★ ${eventName || 'الفعالية'} ★

${organizerName ? `تنظيم: ${organizerName}` : ''}

📅 التاريخ: ${new Date(date).toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
📍 المكان: ${location}

✧ نتطلع لمشاركتكم ✧`;
}

function getPlaceholderImage(themeColor: string): string {
  const colors = ['#3B82F6', '#1E3A5F'];

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
    <text x="400" y="510" font-size="50" fill="white" text-anchor="middle" font-family="sans-serif" font-weight="700">دعوة حضور</text>
    <text x="400" y="560" font-size="24" fill="white" text-anchor="middle" font-family="sans-serif" opacity="0.8">فعالية أعمال</text>
  </svg>`;

  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export async function generateTextVariations(params: any): Promise<string[]> {
  const tones: Array<'formal' | 'elegant' | 'casual'> = ['elegant', 'formal', 'casual'];
  const variations = await Promise.all(
    tones.map(tone => generateInvitationText({ ...params, tone }))
  );
  return variations;
}
