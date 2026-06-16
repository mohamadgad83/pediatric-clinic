'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, Lock, Eye, EyeOff, Sparkles, Heart, Baby } from 'lucide-react'

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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cyan-50 via-white to-pink-50 p-4 relative overflow-hidden">
            
            {/* 🎈 زخارف خلفية متحركة */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-10 left-10 text-6xl animate-bounce opacity-20">🦄</div>
                <div className="absolute bottom-10 right-10 text-5xl animate-bounce delay-100 opacity-20">🌈</div>
                <div className="absolute top-1/2 left-5 text-4xl animate-pulse opacity-10">⭐</div>
                <div className="absolute bottom-1/3 right-5 text-4xl animate-pulse delay-75 opacity-10">🎈</div>
                <div className="absolute top-20 left-1/3 text-3xl animate-spin-slow opacity-10">☁️</div>
                <div className="absolute bottom-20 right-1/3 text-3xl animate-spin-slow opacity-10">🦋</div>
            </div>

            <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 relative z-10 border border-white/50">
                
                {/* 🏥 Logo */}
                <div className="text-center mb-8">
                    <div className="relative inline-block">
                        <div className="text-6xl mb-2 animate-bounce">🏥</div>
                        <div className="absolute -top-2 -right-6 text-2xl animate-pulse">✨</div>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 bg-clip-text text-transparent">
                        PediaCare
                    </h1>
                    <p className="text-gray-500 mt-1 text-lg">🏩 نظام إدارة عيادة الأطفال</p>
                </div>

                {/* 👶 Welcome Message */}
                <div className="bg-gradient-to-r from-cyan-50 to-pink-50 rounded-2xl p-4 mb-6 text-center border border-cyan-100">
                    <p className="text-gray-700">
                        <Baby className="inline w-5 h-5 text-cyan-500 ml-1" />
                        مرحباً بك! سجل الدخول لإدارة عيادتك
                        <Heart className="inline w-4 h-4 text-pink-500 mr-1" />
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* 📝 اسم المستخدم */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                            <User className="w-4 h-4 text-cyan-500" />
                            اسم المستخدم أو البريد الإلكتروني
                        </label>
                        <div className="relative group">
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-200 focus:border-cyan-400 outline-none transition-all duration-300 group-hover:border-cyan-300"
                                placeholder="doctor أو doctor@clinic.com"
                                required
                            />
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-cyan-400 transition-colors" />
                        </div>
                    </div>

                    {/* 🔒 كلمة المرور */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                            <Lock className="w-4 h-4 text-cyan-500" />
                            كلمة المرور
                        </label>
                        <div className="relative group">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-5 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-cyan-200 focus:border-cyan-400 outline-none transition-all duration-300 group-hover:border-cyan-300"
                                placeholder="••••••••"
                                required
                            />
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-cyan-400 transition-colors" />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-500 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    {/* ❌ رسالة الخطأ */}
                    {error && (
                        <div className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-3.5 rounded-2xl text-sm flex items-center gap-2">
                            <span className="text-xl">❌</span>
                            {error}
                        </div>
                    )}

                    {/* 🚀 زر تسجيل الدخول */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-cyan-500 via-blue-500 to-pink-500 hover:from-cyan-600 hover:via-blue-600 hover:to-pink-600 text-white font-bold py-3.5 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-cyan-200/50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-lg"
                    >
                        {loading ? (
                            <>
                                <span className="animate-spin">⏳</span>
                                جاري تسجيل الدخول...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                تسجيل الدخول
                            </>
                        )}
                    </button>
                </form>

                {/* 🔑 الحسابات التجريبية */}
                <div className="mt-8 p-5 bg-gradient-to-r from-cyan-50/80 to-pink-50/80 rounded-2xl border-2 border-cyan-100">
                    <p className="text-center font-semibold text-gray-700 mb-3 flex items-center justify-center gap-2">
                        <span className="text-xl">🔑</span>
                        حسابات تجريبية
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-white p-3.5 rounded-xl border-2 border-cyan-200 hover:border-cyan-400 transition-all hover:shadow-md text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs px-3 py-1 rounded-full font-bold">طبيب</span>
                            </div>
                            <p className="font-mono text-sm text-gray-700">doctor</p>
                            <p className="font-mono text-xs text-gray-400">Doctor@123456</p>
                        </div>
                        <div className="bg-white p-3.5 rounded-xl border-2 border-pink-200 hover:border-pink-400 transition-all hover:shadow-md text-center">
                            <div className="flex items-center justify-center gap-2 mb-1">
                                <span className="bg-gradient-to-r from-pink-500 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-bold">مساعد</span>
                            </div>
                            <p className="font-mono text-sm text-gray-700">assistant</p>
                            <p className="font-mono text-xs text-gray-400">Assistant@123456</p>
                        </div>
                    </div>
                </div>

                {/* 👶 Footer */}
                <div className="mt-6 text-center text-sm text-gray-400">
                    <p className="flex items-center justify-center gap-1">
                        Made with <Heart className="w-4 h-4 text-pink-400 fill-pink-400" /> for little heroes
                    </p>
                </div>
            </div>
        </div>
    )
}
