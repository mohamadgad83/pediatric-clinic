'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function HomePage() {
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            
            if (session) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()

                if (profile?.role === 'doctor') {
                    router.push('/doctor')
                } else {
                    router.push('/assistant')
                }
            } else {
                router.push('/login')
            }
        }

        checkAuth()
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
