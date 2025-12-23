import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phone, name, ticketLink } = body;

    // إعدادات خدمة UltraMsg (سنضع المفاتيح الحقيقية لاحقاً)
    // حالياً هذا الكود جاهز للعمل بمجرد الحصول على الاشتراك
    const instanceId = "YOUR_INSTANCE_ID"; 
    const token = "YOUR_TOKEN";

    // تجهيز نص الرسالة
    const message = `
    مرحباً ${name} 👋
    
    يسعدنا دعوتك لحضور مناسبتنا السعيدة!
    
    تذكرتك الإلكترونية جاهزة، نرجو إبرازها عند الدخول:
    ${ticketLink}
    
    ننتظر تشريفك لنا! 🌹
    `;

    // إذا لم يكن لدينا مفاتيح، سنطبع الرسالة في التيرمينال فقط (للتجربة)
    if (instanceId === "YOUR_INSTANCE_ID") {
      console.log("=================================");
      console.log(`[محاكاة إرسال واتساب]`);
      console.log(`إلى: ${phone}`);
      console.log(`الرسالة: ${message}`);
      console.log("=================================");
      
      // محاكاة تأخير الشبكة
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json({ success: true, message: "تمت المحاكاة بنجاح" });
    }

    // كود الإرسال الحقيقي (سيعمل لاحقاً)
    const response = await fetch(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: token,
        to: phone,
        body: message
      })
    });

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json({ error: 'فشل الإرسال' }, { status: 500 });
  }
}