import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    try {
        const { identifier, password } = await request.json()

        if (!identifier || !password) {
            return NextResponse.json(
                { error: 'اسم المستخدم/البريد الإلكتروني وكلمة المرور مطلوبين' },
                { status: 400 }
            )
        }

        const { data: user, error: userError } = await supabase
            .from('clinic_profiles')
            .select('id, full_name, role, email, username, password_hash')
            .or(`username.eq.${identifier},email.eq.${identifier}`)
            .single()

        if (userError || !user) {
            return NextResponse.json(
                { error: 'بيانات الدخول غير صحيحة' },
                { status: 401 }
            )
        }

        // التحقق من كلمة المرور
        const { data: validUser, error: validError } = await supabase
            .rpc('check_password', {
                input_password: password,
                stored_hash: user.password_hash
            })

        if (validError || !validUser) {
            return NextResponse.json(
                { error: 'بيانات الدخول غير صحيحة' },
                { status: 401 }
            )
        }

        // إنشاء Response مع البيانات
        const response = NextResponse.json({
            user: {
                id: user.id,
                full_name: user.full_name,
                role: user.role,
                email: user.email,
                username: user.username
            }
        })

        // ✅ إضافة Cookies
        response.cookies.set('isLoggedIn', 'true', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7 // 7 أيام
        })

        response.cookies.set('userRole', user.role, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7
        })

        response.cookies.set('userId', user.id, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 7
        })

        return response

    } catch (error) {
        console.error('❌ خطأ في الخادم:', error)
        return NextResponse.json(
            { error: 'حدث خطأ في الخادم' },
            { status: 500 }
        )
    }
}
