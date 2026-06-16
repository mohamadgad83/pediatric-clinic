import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname

    // التحقق من وجود مستخدم
    const isLoggedIn = req.cookies.get('isLoggedIn')?.value === 'true'
    
    console.log('🔐 Middleware:', { path, isLoggedIn })

    // المسارات العامة
    const publicPaths = ['/login', '/api/login']
    const isPublic = publicPaths.some(p => path === p || path.startsWith('/api/'))

    // المسارات المحمية
    const protectedPaths = ['/doctor', '/assistant']
    const isProtected = protectedPaths.some(p => path === p || path.startsWith(p + '/'))

    // لو مش مسجل ويحاول يدخل على صفحة محمية
    if (!isLoggedIn && isProtected) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    // لو مسجل وجاي على login
    if (isLoggedIn && path === '/login') {
        const role = req.cookies.get('userRole')?.value || 'assistant'
        if (role === 'doctor') {
            return NextResponse.redirect(new URL('/doctor', req.url))
        }
        return NextResponse.redirect(new URL('/assistant', req.url))
    }

    // التحقق من الصلاحيات
    if (isLoggedIn && isProtected) {
        const role = req.cookies.get('userRole')?.value || 'assistant'

        if (path.startsWith('/doctor') && role === 'assistant') {
            return NextResponse.redirect(new URL('/assistant', req.url))
        }

        if (path.startsWith('/assistant') && role === 'doctor') {
            return NextResponse.redirect(new URL('/doctor', req.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
