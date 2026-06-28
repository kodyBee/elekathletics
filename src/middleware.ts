import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/coach') && !request.nextUrl.pathname.startsWith('/coach/login')) {
    const authCookie = request.cookies.get('coach_auth');
    if (!authCookie || authCookie.value !== 'true') {
      return NextResponse.redirect(new URL('/coach/login', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/coach/:path*',
};
