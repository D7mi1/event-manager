import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'مِراس - منصة إدارة الفعاليات';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #0A0A0C 0%, #1a1a2e 50%, #0A0A0C 100%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Gold accent line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, transparent, #C19D65, transparent)',
          }}
        />

        {/* Logo text */}
        <div
          style={{
            fontSize: 80,
            fontWeight: 900,
            color: '#C19D65',
            marginBottom: 20,
            letterSpacing: '-2px',
          }}
        >
          مِراس
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            color: 'rgba(255,255,255,0.7)',
            marginBottom: 40,
          }}
        >
          منصة إدارة الفعاليات الذكية
        </div>

        {/* Features */}
        <div
          style={{
            display: 'flex',
            gap: 40,
            fontSize: 18,
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          <span>🎫 تذاكر رقمية</span>
          <span>📱 QR ذكي</span>
          <span>📊 تحليلات مباشرة</span>
          <span>💬 واتساب تلقائي</span>
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 30,
            fontSize: 16,
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          merasapp.com
        </div>
      </div>
    ),
    { ...size }
  );
}
