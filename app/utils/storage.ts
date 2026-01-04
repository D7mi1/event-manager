import { createBrowserClient } from '@supabase/ssr'

// هذه الدالة وظيفتها فقط أخذ الملف ورفعه للسيرفر، وإرجاع الرابط
export async function uploadEventImage(file: File): Promise<string | null> {
  try {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // إنشاء اسم فريد للصورة لتجنب التكرار
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${fileName}`

    // عملية الرفع
    const { error: uploadError } = await supabase.storage
      .from('event-images') // تأكد أن اسم السلة في Supabase يطابق هذا الاسم
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) throw uploadError

    // جلب الرابط العام للصورة
    const { data } = supabase.storage
      .from('event-images')
      .getPublicUrl(filePath)

    return data.publicUrl

  } catch (error) {
    console.error('Upload error:', error)
    alert('حدث خطأ أثناء رفع الصورة')
    return null
  }
}