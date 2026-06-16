'use client'

import { useEffect, useState } from 'react'

export function useAuth() {
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const userData = localStorage.getItem('user')
        if (userData) {
            try {
                setUser(JSON.parse(userData))
            } catch {
                localStorage.removeItem('user')
            }
        }
        setLoading(false)
    }, [])

    const logout = () => {
        localStorage.removeItem('user')
        localStorage.removeItem('isLoggedIn')
        window.location.href = '/login'
    }

    return { user, loading, logout }
}
