import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isLogin = pathname.startsWith('/coach/login');
  const isChangePassword = pathname.startsWith('/coach/change-password');

  if (pathname.startsWith('/coach') && !isLogin) {
    const authCookie = request.cookies.get('coach_auth');
    if (!authCookie || authCookie.value !== 'true') {
      return NextResponse.redirect(new URL('/coach/login', request.url));
    }

    const mustChange = request.cookies.get('coach_must_change');
    if (mustChange?.value === 'true' && !isChangePassword) {
      return NextResponse.redirect(new URL('/coach/change-password', request.url));
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/coach/:path*',
};
