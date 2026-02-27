import { redirect, notFound } from 'next/navigation';
import { createClient } from '@/app/utils/supabase/server'; // 👈 تأكد من مسار الكلاينت عندك

export default async function ShortLinkPage({ params }: { params: Promise<{ code: string }> }) {
    const { code } = await params;
    const supabase = await createClient();

    // البحث عن الرابط الأصلي
    const { data } = await supabase
        .from('short_links')
        .select('original_url')
        .eq('code', code)
        .single();

    if (!data) return notFound();

    // توجيه الزائر
    redirect(data.original_url);
}