import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      name, 
      email, 
      eventTitle, 
      eventDate, 
      eventTime, 
      location, 
      ticketLink, 
      heroImage, 
      qrData, // البيانات الخام
      noKids, 
      noPhoto 
    } = body;

    // 👇 الحل السحري: تحويل البيانات إلى رابط صورة حقيقي على الإنترنت
    // Gmail يعشق الروابط الخارجية ويظهرها فوراً
    const qrImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrData)}&size=300&margin=1&ecLevel=H&format=png`;

    // تصميم الإيميل (Card Design)
    const htmlContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <style>
          body { background-color: #f3f4f6; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; margin: 0; }
          .wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; }
          .header { background-color: #4f46e5; padding: 40px 20px; text-align: center; color: white; background-image: url('${heroImage || ""}'); background-size: cover; background-position: center; position: relative; }
          .header-overlay { background: rgba(79, 70, 229, 0.85); position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 1; }
          .header-content { position: relative; z-index: 2; }
          .content { padding: 30px 20px; text-align: center; color: #333; }
          .details { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px; margin: 20px 0; text-align: right; }
          .detail-item { padding: 8px 0; border-bottom: 1px dashed #e2e8f0; font-size: 14px; }
          .detail-item:last-child { border-bottom: none; }
          .qr-box { margin: 25px 0; padding: 10px; display: inline-block; background: white; border: 2px dashed #cbd5e1; border-radius: 12px; }
          .btn { background-color: #4f46e5; color: #ffffff !important; padding: 14px 28px; text-decoration: none; border-radius: 50px; font-weight: bold; display: inline-block; margin-top: 10px; box-shadow: 0 4px 10px rgba(79, 70, 229, 0.2); }
          .tags { margin-top: 20px; display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; }
          .tag { font-size: 11px; padding: 4px 10px; border-radius: 20px; font-weight: bold; }
          .tag-red { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
        </style>
      </head>
      <body>
        <div class="wrapper">
          <div class="header">
            <div class="${heroImage ? 'header-overlay' : ''}"></div>
            <div class="header-content">
              <h1 style="margin:0; font-size: 24px;">${eventTitle}</h1>
              <p style="margin:5px 0 0; opacity: 0.9;">تم تأكيد تسجيلك بنجاح ✅</p>
            </div>
          </div>

          <div class="content">
            <h2 style="color: #1e293b;">أهلاً بك، ${name} 👋</h2>
            
            <div class="details">
               <div class="detail-item"><strong>📅 التاريخ:</strong> ${eventDate}</div>
               <div class="detail-item"><strong>⏰ الوقت:</strong> ${eventTime}</div>
               <div class="detail-item"><strong>📍 الموقع:</strong> ${location}</div>
            </div>

            <div class="qr-box">
              <img src="${qrImageUrl}" alt="QR Code" width="200" height="200" style="display:block;" />
              <p style="margin:5px 0 0; font-size:12px; color:#94a3b8;">امسح الرمز للدخول</p>
            </div>

            <br/>
            <a href="${ticketLink}" class="btn">عرض التذكرة والتقويم</a>

            <div class="tags">
               ${noKids ? '<span class="tag tag-red">👶 ممنوع الأطفال</span>' : ''}
               ${noPhoto ? '<span class="tag tag-red">📵 ممنوع التصوير</span>' : ''}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const data = await resend.emails.send({
      from: 'Event Manager <onboarding@resend.dev>',
      to: [email],
      subject: `تذكرة دخول: ${eventTitle} 🎫`,
      html: htmlContent,
    });

    if (data.error) {
        return NextResponse.json({ error: data.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}