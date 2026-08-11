import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveCustomerHostStatus, MAIN_DOMAIN } from '@/lib/customers';

export async function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';
  const cleanHost = hostname.split(':')[0];

  if (cleanHost === MAIN_DOMAIN || cleanHost === 'localhost' || cleanHost === '127.0.0.1' || hostname.endsWith('.vercel.app')) {
    return NextResponse.next();
  }

  // Local dev subdomains, e.g. barberagus.localhost:8765 -> /sites/barberagus
  if (cleanHost.endsWith('.localhost') || cleanHost.endsWith('.127.0.0.1')) {
    const slug = cleanHost.split('.')[0];
    if (slug && slug !== 'www') {
      url.pathname = `/sites/${slug}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
    return NextResponse.next();
  }

  // Subdomains of webbinaja.com AND registered custom domains (Business Kit
  // feature). resolveCustomerHostStatus checks both cases against the
  // customer configs (see src/lib/customers.ts), so a bare custom domain
  // like "tokokue.com" resolves correctly here instead of falling through
  // to the main landing page. Suspended sites are routed to a dedicated
  // notice page instead — without this, a suspended site's visitors would
  // silently see the main marketing homepage (NextResponse.next() renders
  // "/" regardless of hostname).
  const match = await resolveCustomerHostStatus(hostname);
  if (match.status === 'active') {
    url.pathname = `/sites/${match.slug}${url.pathname}`;
    return NextResponse.rewrite(url);
  }
  if (match.status === 'suspended') {
    url.pathname = '/site-suspended';
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
