'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [role, setRole] = useState<'doctor' | 'assistant' | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getUser = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            
            if (session?.user) {
                setUser(session.user)
                
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()
                
                setRole(profile?.role || null)
            }
            
            setLoading(false)
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                setUser(session?.user || null)
                if (session?.user) {
                    supabase
                        .from('profiles')
                        .select('role')
                        .eq('id', session.user.id)
                        .single()
                        .then(({ data }) => setRole(data?.role || null))
                } else {
                    setRole(null)
                }
                setLoading(false)
            }
        )

        return () => subscription.unsubscribe()
    }, [])

    return { user, role, loading }
}
