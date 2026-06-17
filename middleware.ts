import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value === 'true';
  const userRole = request.cookies.get('userRole')?.value; // 'doctor' أو 'assistant'
  const { pathname } = request.nextUrl;

  // 1. إذا لم يكن مسجلاً ويحاول دخول لوحات التحكم
  if (!isLoggedIn && (pathname.startsWith('/doctor') || pathname.startsWith('/assistant'))) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. حماية مسار الطبيب من المساعد
  if (pathname.startsWith('/doctor') && userRole !== 'doctor') {
    return NextResponse.redirect(new URL('/assistant/dashboard', request.url));
  }

  // 3. حماية مسار المساعد من الطبيب
  if (pathname.startsWith('/assistant') && userRole !== 'assistant') {
    return NextResponse.redirect(new URL('/doctor/dashboard', request.url));
  }

  // 4. إذا كان مسجلاً ويحاول دخول صفحة الـ Login
 // ❌ القديم (بيوجّه لـ /doctor/dashboard)
if (isLoggedIn && pathname === '/login') {
  return NextResponse.redirect(
    new URL(userRole === 'doctor' ? '/doctor/dashboard' : '/assistant/dashboard', request.url)
  );
}

// ✅ الجديد (بيوجّه لـ /doctor و /assistant)
if (isLoggedIn && pathname === '/login') {
  return NextResponse.redirect(
    new URL(userRole === 'doctor' ? '/doctor' : '/assistant', request.url)
  );
}
  return NextResponse.next();
}

export const config = {
  matcher: ['/doctor/:path*', '/assistant/:path*', '/login'],
};
