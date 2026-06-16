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

        // استخدام الدالة للتحقق
        const { data: userData, error } = await supabase.rpc(
            'verify_user',
            {
                p_identifier: identifier,
                p_password: password
            }
        )

        if (error || !userData || userData.length === 0) {
            return NextResponse.json(
                { error: 'بيانات الدخول غير صحيحة' },
                { status: 401 }
            )
        }

        const user = userData[0]

        return NextResponse.json({
            user: {
                id: user.user_id,
                full_name: user.full_name,
                role: user.user_role,
                email: user.user_email,
                username: user.user_username
            }
        })

    } catch {
        return NextResponse.json(
            { error: 'حدث خطأ في الخادم' },
            { status: 500 }
        )
    }
}
