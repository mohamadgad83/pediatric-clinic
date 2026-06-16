'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [identifier, setIdentifier] = useState('doctor')
    const [password, setPassword] = useState('Doctor@123456')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'فشل تسجيل الدخول')
                setLoading(false)
                return
            }

            localStorage.setItem('user', JSON.stringify(data.user))
            localStorage.setItem('isLoggedIn', 'true')

            if (data.user.role === 'doctor') {
                router.push('/doctor')
            } else {
                router.push('/assistant')
            }
        } catch {
            setError('حدث خطأ في الاتصال بالخادم')
        }
        setLoading(false)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <div className="text-5xl mb-3">🏥</div>
                    <h1 className="text-3xl font-bold text-gray-800">PediaCare</h1>
                    <p className="text-gray-500 mt-1">نظام إدارة عيادة الأطفال</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            اسم المستخدم أو البريد الإلكتروني
                        </label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="أدخل اسم المستخدم أو البريد"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            كلمة المرور
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                            placeholder="أدخل كلمة المرور"
                            required
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
                    >
                        {loading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول'}
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-500">
                    <p>حسابات تجريبية:</p>
                    <p className="mt-1">
                        <span className="font-medium">طبيب:</span> doctor أو doctor@clinic.com / Doctor@123456
                    </p>
                    <p>
                        <span className="font-medium">مساعد:</span> assistant أو assistant@clinic.com / Assistant@123456
                    </p>
                </div>
            </div>
        </div>
    )
}
