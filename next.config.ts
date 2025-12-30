import type { NextConfig } from "next";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public", // مجلد التخزين
  cacheOnFrontEndNav: true, // تخزين الصفحات عند التنقل
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true, // تحديث الصفحة عند عودة النت
  swcMinify: true,
  disable: process.env.NODE_ENV === "development", // تعطيله أثناء التطوير
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig: NextConfig = {
  // إعداداتك الحالية هنا (إن وجدت)
};

export default withPWA(nextConfig);