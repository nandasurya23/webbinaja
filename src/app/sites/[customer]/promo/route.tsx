import { ImageResponse } from 'next/og';
import { getCustomerConfig } from '@/lib/customers';

const SIZE = 1080;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ customer: string }> }
): Promise<Response> {
  const { customer } = await params;
  const config = await getCustomerConfig(customer);

  if (!config || config.package !== 'business') {
    return new Response('Not Found', { status: 404 });
  }

  const initial = config.businessName.trim().charAt(0).toUpperCase() || '?';
  const { primaryColor, secondaryColor } = config.theme;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#09090b',
          fontFamily: 'Inter, sans-serif',
          overflow: 'hidden',
        }}
      >
        {/* Background Gradients */}
        <div
          style={{
            position: 'absolute',
            top: '-20%',
            left: '-10%',
            width: '80%',
            height: '80%',
            background: `radial-gradient(circle, ${primaryColor}40 0%, transparent 70%)`,
            filter: 'blur(80px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-20%',
            right: '-10%',
            width: '80%',
            height: '80%',
            background: `radial-gradient(circle, ${secondaryColor}30 0%, transparent 70%)`,
            filter: 'blur(80px)',
          }}
        />
        
        {/* Grid pattern overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.5,
          }}
        />

        {/* Content Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            padding: '120px',
            zIndex: 10,
          }}
        >
          {/* Badge/Logo */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 180,
              height: 180,
              borderRadius: 40,
              background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              color: '#ffffff',
              fontSize: 80,
              fontWeight: 800,
              marginBottom: 64,
              boxShadow: `0 20px 40px -10px ${primaryColor}60, inset 0 2px 10px rgba(255,255,255,0.4)`,
              border: '2px solid rgba(255,255,255,0.2)',
            }}
          >
            {initial}
          </div>

          {/* Title */}
          <div
            style={{
              display: 'flex',
              fontSize: 84,
              fontWeight: 800,
              color: '#ffffff',
              textAlign: 'center',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              marginBottom: 32,
              textShadow: '0 4px 20px rgba(0,0,0,0.5)',
            }}
          >
            {config.businessName}
          </div>

          {/* Tagline */}
          {config.tagline && (
            <div
              style={{
                display: 'flex',
                fontSize: 36,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.7)',
                textAlign: 'center',
                marginBottom: 80,
                letterSpacing: '-0.01em',
              }}
            >
              {config.tagline}
            </div>
          )}

          {/* CTA Button (WhatsApp) */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 56px',
              borderRadius: 100,
              background: '#ffffff',
              color: '#000000',
              fontSize: 32,
              fontWeight: 700,
              boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
              gap: 16,
            }}
          >
            <span style={{ color: '#25D366' }}>WhatsApp</span>
            <span>{config.contact.whatsapp}</span>
          </div>
        </div>

        {/* Footer Brand */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 500,
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.05em',
          }}
        >
          POWERED BY WEBBINAJA
        </div>
      </div>
    ),
    {
      width: SIZE,
      height: SIZE,
      headers: {
        'Cache-Control': 'public, max-age=3600, must-revalidate',
      },
    }
  );
}
