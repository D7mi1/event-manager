/**
 * WhatsApp Helper - إنشاء روابط واتساب
 */
export const generateWhatsAppLink = (
  phone: string,
  guestName: string,
  eventName: string,
  ticketId: string,
  tableName?: string
) => {
  let cleanPhone = phone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('05')) cleanPhone = '966' + cleanPhone.substring(1);
  else if (cleanPhone.startsWith('5')) cleanPhone = '966' + cleanPhone;

  const domain = typeof window !== 'undefined' ? window.location.origin : '';
  const ticketUrl = `${domain}/t/${ticketId}`;

  let message = `مرحباً ${guestName} 👋،\n\nيسعدنا دعوتك لحضور حفل *${eventName}* ✨\n\nتذكرتك جاهزة، نرجو إبرازها عند الدخول 🎟️:\n${ticketUrl}`;

  if (tableName) {
    message += `\n\n📍 مكان الجلوس: *${tableName}*`;
  }

  message += `\n\nننتظركم بشوق! 🌹`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};
