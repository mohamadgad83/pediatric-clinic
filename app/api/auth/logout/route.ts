import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out successfully' });

  // مسح الكوكيز الخاصة بالجلسة والصلاحيات تماماً
  response.cookies.set('isLoggedIn', '', { path: '/', maxAge: 0 });
  response.cookies.set('userRole', '', { path: '/', maxAge: 0 });
  response.cookies.set('userId', '', { path: '/', maxAge: 0 });

  return response;
}
