/**
 * Wedding Invitation Email Template
 * ==================================
 * قالب دعوة زفاف ذهبي احترافي باستخدام React Email
 * يدعم RTL + Dark Mode + Mobile Responsive
 */

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import { Tailwind } from '@react-email/tailwind';
import * as React from 'react';

export interface WeddingInvitationProps {
  guestName: string;
  groomName: string;
  brideName: string;
  eventDate: string;
  eventTime: string;
  hijriDate?: string;
  location: string;
  locationUrl?: string;
  ticketLink: string;
  qrData: string;
  seatInfo?: string;
  noKids?: boolean;
  noPhoto?: boolean;
  customMessage?: string;
}

export function WeddingInvitationEmail({
  guestName = 'ضيفنا الكريم',
  groomName = 'محمد',
  brideName = 'سارة',
  eventDate = '15 رجب 1447',
  eventTime = '8:00 مساءً',
  hijriDate,
  location = 'قاعة الريتز كارلتون، الرياض',
  locationUrl,
  ticketLink = 'https://merasapp.com/t/example',
  qrData = 'example-qr',
  seatInfo,
  noKids = false,
  noPhoto = false,
  customMessage,
}: WeddingInvitationProps) {
  const qrImageUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrData)}&size=250&margin=1&ecLevel=H&format=png`;

  return (
    <Html dir="rtl" lang="ar">
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap');
          @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&display=swap');
          * { font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        `}</style>
      </Head>
      <Preview>دعوة زفاف {groomName} و {brideName} - يشرفنا حضورك</Preview>
      <Tailwind>
        <Body className="bg-[#0F0F12] m-0 p-0">
          <Container className="mx-auto my-8 max-w-[560px] px-4">

            {/* البسملة والزخرفة */}
            <Section className="text-center pt-10 pb-4">
              <Text className="text-[#C19D65] text-sm font-bold m-0 tracking-widest">
                ✦ ✦ ✦
              </Text>
              <Text className="text-[#C19D65]/60 text-xs m-0 mt-3" style={{ fontFamily: "'Amiri', serif" }}>
                بسم الله الرحمن الرحيم
              </Text>
            </Section>

            {/* البطاقة الرئيسية */}
            <Section className="bg-gradient-to-b from-[#1A1A1F] to-[#12121A] rounded-[2rem] overflow-hidden border border-[#C19D65]/20">

              {/* الهيدر الذهبي */}
              <Section className="bg-gradient-to-b from-[#C19D65]/15 to-transparent px-8 pt-10 pb-6 text-center">
                <Text className="text-[#C19D65] text-xs font-bold tracking-[0.3em] uppercase m-0">
                  دعوة زفاف
                </Text>
                <Heading className="text-white text-4xl font-extrabold m-0 mt-4" style={{ fontFamily: "'Amiri', serif", lineHeight: '1.4' }}>
                  {groomName}
                </Heading>
                <Text className="text-[#C19D65] text-2xl m-0 my-1" style={{ fontFamily: "'Amiri', serif" }}>
                  &
                </Text>
                <Heading className="text-white text-4xl font-extrabold m-0" style={{ fontFamily: "'Amiri', serif", lineHeight: '1.4' }}>
                  {brideName}
                </Heading>
                <Hr className="border-[#C19D65]/20 my-6 w-24 mx-auto" />
              </Section>

              {/* الترحيب */}
              <Section className="px-8 pb-6 text-center">
                <Text className="text-white/90 text-base m-0 leading-relaxed">
                  يسر عائلتي العريس والعروس دعوتكم
                </Text>
                <Text className="text-[#C19D65] text-xl font-bold m-0 mt-2">
                  {guestName}
                </Text>
                <Text className="text-white/60 text-sm m-0 mt-2 leading-relaxed">
                  لحضور حفل الزفاف بمشيئة الله تعالى
                </Text>
                {customMessage && (
                  <Text className="text-white/50 text-sm m-0 mt-4 italic border-r-2 border-[#C19D65]/30 pr-4 text-right">
                    {customMessage}
                  </Text>
                )}
              </Section>

              {/* تفاصيل الفعالية */}
              <Section className="mx-8 mb-6 bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden">
                {/* التاريخ */}
                <Section className="px-6 py-4 border-b border-white/5">
                  <table width="100%" cellPadding={0} cellSpacing={0}>
                    <tr>
                      <td width="36" style={{ verticalAlign: 'top' }}>
                        <Text className="text-[#C19D65] text-lg m-0">📅</Text>
                      </td>
                      <td>
                        <Text className="text-white/40 text-[11px] font-bold m-0">التاريخ</Text>
                        <Text className="text-white text-sm font-bold m-0 mt-1">{eventDate}</Text>
                        {hijriDate && (
                          <Text className="text-white/40 text-xs m-0 mt-0.5">{hijriDate}</Text>
                        )}
                      </td>
                    </tr>
                  </table>
                </Section>

                {/* الوقت */}
                <Section className="px-6 py-4 border-b border-white/5">
                  <table width="100%" cellPadding={0} cellSpacing={0}>
                    <tr>
                      <td width="36" style={{ verticalAlign: 'top' }}>
                        <Text className="text-[#C19D65] text-lg m-0">🕗</Text>
                      </td>
                      <td>
                        <Text className="text-white/40 text-[11px] font-bold m-0">الوقت</Text>
                        <Text className="text-white text-sm font-bold m-0 mt-1">{eventTime}</Text>
                      </td>
                    </tr>
                  </table>
                </Section>

                {/* الموقع */}
                <Section className="px-6 py-4">
                  <table width="100%" cellPadding={0} cellSpacing={0}>
                    <tr>
                      <td width="36" style={{ verticalAlign: 'top' }}>
                        <Text className="text-[#C19D65] text-lg m-0">📍</Text>
                      </td>
                      <td>
                        <Text className="text-white/40 text-[11px] font-bold m-0">الموقع</Text>
                        {locationUrl ? (
                          <Link href={locationUrl} className="text-white text-sm font-bold no-underline hover:text-[#C19D65] block mt-1">
                            {location} ←
                          </Link>
                        ) : (
                          <Text className="text-white text-sm font-bold m-0 mt-1">{location}</Text>
                        )}
                      </td>
                    </tr>
                  </table>
                </Section>

                {/* المقعد */}
                {seatInfo && (
                  <Section className="px-6 py-4 border-t border-white/5">
                    <table width="100%" cellPadding={0} cellSpacing={0}>
                      <tr>
                        <td width="36" style={{ verticalAlign: 'top' }}>
                          <Text className="text-[#C19D65] text-lg m-0">💺</Text>
                        </td>
                        <td>
                          <Text className="text-white/40 text-[11px] font-bold m-0">المقعد</Text>
                          <Text className="text-white text-sm font-bold m-0 mt-1">{seatInfo}</Text>
                        </td>
                      </tr>
                    </table>
                  </Section>
                )}
              </Section>

              {/* تنبيهات */}
              {(noKids || noPhoto) && (
                <Section className="mx-8 mb-6 text-center">
                  {noKids && (
                    <span style={{ display: 'inline-block', fontSize: '11px', padding: '4px 14px', borderRadius: '20px', fontWeight: 'bold', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)', margin: '0 4px' }}>
                      ممنوع اصطحاب الأطفال
                    </span>
                  )}
                  {noPhoto && (
                    <span style={{ display: 'inline-block', fontSize: '11px', padding: '4px 14px', borderRadius: '20px', fontWeight: 'bold', background: 'rgba(239,68,68,0.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,0.2)', margin: '0 4px' }}>
                      ممنوع التصوير
                    </span>
                  )}
                </Section>
              )}

              {/* QR Code */}
              <Section className="text-center pb-6">
                <Section className="inline-block mx-auto bg-white rounded-2xl p-4" style={{ display: 'inline-block' }}>
                  <Img
                    src={qrImageUrl}
                    alt="QR Code"
                    width={180}
                    height={180}
                    className="block rounded-lg"
                  />
                </Section>
                <Text className="text-white/30 text-[11px] m-0 mt-3 font-bold">
                  امسح الرمز عند البوابة للدخول
                </Text>
              </Section>

              {/* زر عرض التذكرة */}
              <Section className="text-center pb-10 px-8">
                <Link
                  href={ticketLink}
                  className="inline-block bg-[#C19D65] text-black font-extrabold text-sm px-10 py-4 rounded-2xl no-underline"
                  style={{ display: 'inline-block' }}
                >
                  عرض التذكرة الكاملة
                </Link>
              </Section>
            </Section>

            {/* الزخرفة السفلية */}
            <Section className="text-center py-6">
              <Text className="text-[#C19D65]/40 text-sm m-0">
                ✦ ✦ ✦
              </Text>
              <Text className="text-white/20 text-xs m-0 mt-3">
                تم إرسال هذه الدعوة عبر منصة مِراس
              </Text>
              <Text className="text-white/10 text-[10px] m-0 mt-1">
                &copy; {new Date().getFullYear()} مِراس. جميع الحقوق محفوظة.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}

export default WeddingInvitationEmail;
