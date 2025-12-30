// app/utils/whatsappHelper.ts
export const generateWhatsAppLink = (
  phone: string, 
  guestName: string, 
  eventName: string, 
  ticketId: string
) => {
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('05')) cleanPhone = '966' + cleanPhone.substring(1);
  else if (cleanPhone.startsWith('5')) cleanPhone = '966' + cleanPhone;

  // رابط التذكرة (تأكد أن دومين موقعك صحيح في متغيرات البيئة)
  const domain = typeof window !== 'undefined' ? window.location.origin : ''; 
  const ticketUrl = `${domain}/t/${ticketId}`;

  const message = `مرحباً ${guestName} 👋،\n\nيسعدنا دعوتك لحضور حفل *${eventName}* ✨\n\nتذكرتك جاهزة، نرجو إبرازها عند الدخول 🎟️:\n${ticketUrl}\n\nننتظركم بشوق! 📍`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};