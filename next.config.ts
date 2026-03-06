import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        // كاش صفحة الماسح للعمل بدون إنترنت
        urlPattern: /\/scan\/.*/i,
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "scanner-pages",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24, // يوم واحد
          },
        },
      },
      {
        // كاش الخطوط
        urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts",
          expiration: {
            maxEntries: 10,
            maxAgeSeconds: 60 * 60 * 24 * 365, // سنة
          },
        },
      },
      {
        // كاش الصور
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif|ico)$/i,
        handler: "CacheFirst",
        options: {
          cacheName: "static-images",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24 * 30, // شهر
          },
        },
      },
      {
        // كاش الأصوات (للماسح)
        urlPattern: /\/sounds\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "audio-assets",
          expiration: {
            maxEntries: 5,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
        },
      },
      {
        // كاش Supabase API (stale while revalidate)
        urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/i,
        handler: "NetworkFirst",
        options: {
          cacheName: "supabase-api",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 5, // 5 دقائق
          },
          networkTimeoutSeconds: 10,
        },
      },
    ],
  },
});

const isDevelopment = process.env.NODE_ENV === 'development';

// 🔐 Content Security Policy - مستوحى من production-saas-starter
const ContentSecurityPolicy = [
  "default-src 'self';",
  "script-src 'self' 'unsafe-inline';",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
  "img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://quickchart.io;",
  "font-src 'self' https://fonts.gstatic.com;",
  isDevelopment
    ? "connect-src 'self' ws://localhost:* https://*.supabase.co https://api-inference.huggingface.co;"
    : "connect-src 'self' https://*.supabase.co https://api-inference.huggingface.co;",
  "frame-src 'none';",
  "object-src 'none';",
  "base-uri 'self';",
  "form-action 'self';",
  "frame-ancestors 'none';",
].join(" ");

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
    ],
  },

  serverExternalPackages: ["pdfmake", "passkit-generator", "web-push"],

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  // 🔐 Security Headers الشاملة
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // DNS Prefetch - أداء أفضل
          {
            key: "X-DNS-Prefetch-Control",
            value: "on"
          },
          // HSTS - فرض HTTPS لمدة سنتين
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload"
          },
          // منع تخمين نوع المحتوى
          {
            key: "X-Content-Type-Options",
            value: "nosniff"
          },
          // منع تضمين الموقع في iframe (حماية Clickjacking)
          {
            key: "X-Frame-Options",
            value: "DENY"
          },
          // حماية XSS في المتصفحات القديمة
          {
            key: "X-XSS-Protection",
            value: "1; mode=block"
          },
          // سياسة الإحالة
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin"
          },
          // تعطيل الكاميرا والميكروفون والموقع و FLoC
          {
            key: "Permissions-Policy",
            value: "camera=(self), microphone=(), geolocation=(), interest-cohort=()"
          },
          // Content Security Policy
          {
            key: "Content-Security-Policy",
            value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim()
          },
          // حماية الموارد من الوصول عبر المواقع
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-site"
          },
          // حماية النوافذ المنبثقة
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups"
          },
        ]
      },
      // كاش الملفات الثابتة
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable"
          },
        ],
      },
      {
        source: "/favicon.ico",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=0, s-maxage=31536000, immutable"
          },
        ],
      },
    ];
  },
};

// Sentry source map upload فقط عند وجود SENTRY_AUTH_TOKEN
const sentryOptions = {
  org: "meras",
  project: "meras-app",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableLogger: true,
  sourcemaps: {
    disable: !process.env.SENTRY_AUTH_TOKEN,
  },
};

export default withSentryConfig(withPWA(nextConfig), sentryOptions);
