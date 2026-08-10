import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Define allowed domains (including localhost for dev)
  const allowedDomains = ['webbinaja.com', 'localhost:8765', '127.0.0.1:8765'];
  
  // Check if the current hostname is a custom subdomain
  // We exclude .vercel.app so the main landing page works on Vercel's default domain
  const isCustomSubdomain = !allowedDomains.includes(hostname) && !hostname.endsWith('.vercel.app');

  if (isCustomSubdomain) {
    // Extract the subdomain slug
    // Example: "barberagus.webbinaja.com" -> "barberagus"
    // Example: "barberagus.localhost:3000" -> "barberagus"
    const currentHost = hostname.split(':')[0]; // remove port if exists
    const domainParts = currentHost.split('.');
    
    let slug = '';
    
    if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
       if (domainParts.length > 1) {
           slug = domainParts[0];
       }
    } else {
       if (domainParts.length > 2) {
           slug = domainParts[0];
       }
    }

    if (slug && slug !== 'www') {
      // Rewrite the request to the internal dynamic route
      // e.g., / -> /sites/barberagus/
      url.pathname = `/sites/${slug}${url.pathname}`;
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
