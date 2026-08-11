import { ImageResponse } from 'next/og';
import { getCustomerConfig } from '@/lib/customers';

// "Kit Promosi Instan" — a ready-to-post square banner (1080x1080, fits
// both Instagram feed posts and can be cropped for Stories), generated on
// request from the customer's own config data (business name, tagline,
// theme colors, WhatsApp number). Only 'business' package customers get
// this — a 'basic' customer's slug 404s here even though the route itself
// is public, so the tier distinction is enforced in code, not just sales
// process. No remote logo fetch: many customers haven't uploaded a real
// logo yet (default placeholder filenames may not exist on the CDN), so a
// network fetch here would be a flaky failure mode for an image-generation
// request — an initial-letter badge is used instead, which always renders.
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
  const { primaryColor, secondaryColor, accentColor } = config.theme;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 80,
          background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 160,
            height: 160,
            borderRadius: '50%',
            background: accentColor,
            color: '#111111',
            fontSize: 72,
            fontWeight: 700,
            marginBottom: 48,
          }}
        >
          {initial}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 72,
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.15,
            marginBottom: 24,
          }}
        >
          {config.businessName}
        </div>
        {config.tagline && (
          <div
            style={{
              display: 'flex',
              fontSize: 34,
              color: 'rgba(255,255,255,0.85)',
              textAlign: 'center',
              marginBottom: 64,
            }}
          >
            {config.tagline}
          </div>
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 48px',
            borderRadius: 999,
            background: accentColor,
            color: '#111111',
            fontSize: 30,
            fontWeight: 700,
          }}
        >
          Hubungi via WhatsApp: {config.contact.whatsapp}
        </div>
        <div
          style={{
            position: 'absolute',
            bottom: 32,
            right: 40,
            display: 'flex',
            fontSize: 20,
            color: 'rgba(255,255,255,0.55)',
          }}
        >
          dibuat oleh WebbinAja
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
