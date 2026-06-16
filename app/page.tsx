'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
    const router = useRouter()

    useEffect(() => {
        const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'
        const userData = localStorage.getItem('user')
        
        console.log('🔍 التحقق من حالة الدخول:', { isLoggedIn, userData })
        
        if (isLoggedIn && userData) {
            try {
                const user = JSON.parse(userData)
                console.log('👤 المستخدم:', user)
                if (user.role === 'doctor') {
                    router.push('/doctor')
                } else {
                    router.push('/assistant')
                }
            } catch (e) {
                console.error('❌ خطأ في قراءة البيانات:', e)
                router.push('/login')
            }
        } else {
            router.push('/login')
        }
    }, [router])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
                <div className="text-4xl mb-4">🔄</div>
                <p className="text-gray-500">جاري التحميل...</p>
            </div>
        </div>
    )
}
