import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req, res })
    
    const { data: { session } } = await supabase.auth.getSession()
    const path = req.nextUrl.pathname

    const publicPaths = ['/login', '/auth/callback']
    const isPublic = publicPaths.some(p => path === p || path.startsWith('/auth/'))

    const protectedPaths = ['/doctor', '/assistant']
    const isProtected = protectedPaths.some(p => path === p || path.startsWith(p + '/'))

    if (!session && isProtected) {
        return NextResponse.redirect(new URL('/login', req.url))
    }

    if (session && path === '/login') {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

        if (profile?.role === 'doctor') {
            return NextResponse.redirect(new URL('/doctor', req.url))
        }
        return NextResponse.redirect(new URL('/assistant', req.url))
    }

    if (session && isProtected) {
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single()

        if (path.startsWith('/doctor') && profile?.role === 'assistant') {
            return NextResponse.redirect(new URL('/assistant', req.url))
        }

        if (path.startsWith('/assistant') && profile?.role === 'doctor') {
            return NextResponse.redirect(new URL('/doctor', req.url))
        }
    }

    return res
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
