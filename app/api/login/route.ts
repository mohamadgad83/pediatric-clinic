import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// إنشاء عميل Supabase مع Service Role Key
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! // 👈 هنضيفه في Vercel بعدين
)

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json()

        // التحقق من وجود البريد وكلمة المرور
        if (!email || !password) {
            return NextResponse.json(
                { error: 'البريد الإلكتروني وكلمة المرور مطلوبين' },
                { status: 400 }
            )
        }

        // 1. البحث عن المستخدم في clinic_profiles
        const { data: profile, error } = await supabase
            .from('clinic_profiles')
            .select('id, full_name, role, email, password_hash, confirmed')
            .eq('email', email)
            .single()

        // لو المستخدم مش موجود
        if (error || !profile) {
            return NextResponse.json(
                { error: 'البريد الإلكتروني غير موجود' },
                { status: 401 }
            )
        }

        // 2. التحقق من تفعيل الحساب
        if (!profile.confirmed) {
            return NextResponse.json(
                { error: 'الحساب غير مفعل، برجاء التواصل مع الإدارة' },
                { status: 401 }
            )
        }

        // 3. التحقق من كلمة المرور (باستخدام pgcrypto)
        // نستخدم استعلام مباشر للتحقق من كلمة المرور
        const { data: validUser, error: checkError } = await supabase
            .from('clinic_profiles')
            .select('id')
            .eq('email', email)
            .eq('password_hash', password) // مؤقت، لكن هنعدله بعدين
            .single()

        // لو فشل التحقق
        if (checkError || !validUser) {
            return NextResponse.json(
                { error: 'كلمة المرور غير صحيحة' },
                { status: 401 }
            )
        }

        // 4. إرجاع بيانات المستخدم (من غير كلمة المرور)
        return NextResponse.json({
            user: {
                id: profile.id,
                full_name: profile.full_name,
                role: profile.role,
                email: profile.email
            }
        })

    } catch (error) {
        console.error('Login error:', error)
        return NextResponse.json(
            { error: 'حدث خطأ في الخادم' },
            { status: 500 }
        )
    }
}
