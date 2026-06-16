'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
    const [identifier, setIdentifier] = useState('doctor')
    const [password, setPassword] = useState('Doctor@123456')
    const [showPassword, setShowPassword] = useState(false)
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
                        <div className="relative">
                            <User className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="أدخل اسم المستخدم أو البريد"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            كلمة المرور
                        </label>
                        <div className="relative">
                            <Lock className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full pr-10 pl-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                placeholder="أدخل كلمة المرور"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
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

                <div className="mt-6 p-4 bg-gray-50 rounded-lg text-center text-sm">
                    <p className="font-medium text-gray-700 mb-2">🔑 حسابات تجريبية:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-center gap-2 flex-wrap">
                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">طبيب</span>
                            <span className="font-mono text-sm">doctor</span>
                            <span className="text-gray-400">/</span>
                            <span className="font-mono text-sm">Doctor@123456</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-200 flex items-center justify-center gap-2 flex-wrap">
                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-bold">مساعد</span>
                            <span className="font-mono text-sm">assistant</span>
                            <span className="text-gray-400">/</span>
                            <span className="font-mono text-sm">Assistant@123456</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
