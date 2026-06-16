import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
    try {
        const { username, password } = await request.json()

        if (!username || !password) {
            return NextResponse.json(
                { error: 'اسم المستخدم وكلمة المرور مطلوبين' },
                { status: 400 }
            )
        }

        // استخدام الدالة للتحقق
        const { data: userData, error } = await supabase.rpc(
            'verify_user',
            {
                p_username: username,
                p_password: password
            }
        )

        if (error || !userData || userData.length === 0) {
            return NextResponse.json(
                { error: 'اسم المستخدم أو كلمة المرور غير صحيحة' },
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
                username: username
            }
        })

    } catch {
        return NextResponse.json(
            { error: 'حدث خطأ في الخادم' },
            { status: 500 }
        )
    }
}
