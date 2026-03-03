'use server';

import { createClient } from '@/lib/supabase/server';
import { nanoid } from 'nanoid';

// 1. دالة اختصار الرابط
export async function createShortLink(longUrl: string) {
    const supabase = await createClient();
    const shortCode = nanoid(6); // كود من 6 خانات عشوائية

    const { error } = await supabase
        .from('short_links')
        .insert({ code: shortCode, original_url: longUrl });

    if (error) throw new Error('فشل إنشاء الرابط');

    // استبدل هذا برابط موقعك الحقيقي عند الرفع للسيرفر
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    return `${baseUrl}/s/${shortCode}`;
}

// 2. دالة توليد نص الدعوة (قوالب ذكية)
export async function generateInviteMessage(guestName: string, eventName: string, link: string) {
    const templates = [
        `أهلاً بك أ. ${guestName}،\nيسعدنا جداً تشريفك لنا في "${eventName}".\n\nتذكرتك الرقمية جاهزة عبر الرابط:\n${link}\n\nننتظر رؤيتك! 🌟`,
        `دعوة خاصة ✨\n\nالسيد/ة ${guestName}،\nحضورك يضيف لجمال مناسبتنا "${eventName}" تألقاً.\n\nالرجاء تأكيد الدخول عبر تذكرتك الخاصة:\n${link}`,
        `مرحباً ${guestName} 👋\nلا تفوت فرصة التواجد في "${eventName}"!\n\nلقد قمنا بتجهيز مقعدك، تفضل تذكرتك:\n${link}`
    ];

    return templates[Math.floor(Math.random() * templates.length)];
}