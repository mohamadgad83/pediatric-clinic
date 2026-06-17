'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  HeartPulse, User, Lock, ArrowLeft, 
  Eye, EyeOff, Loader2, ShieldAlert, LayoutGrid 
} from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  
  // حالات المدخلات والتحميل
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // معالجة تسجيل الدخول وربطه بالـ API الخاص بك
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'فشل تسجيل الدخول، تأكد من البيانات.')
      }

      // حفظ البيانات محلياً للتأكيد (كما هو متبع في مشروعك)
      localStorage.setItem('user_role', result.user.role)
      localStorage.setItem('user_name', result.user.full_name)

      // التوجيه التلقائي الذكي حسب الصلاحية المستلمة من الـ DB
      if (result.user.role === 'doctor') {
        router.push('/doctor')
      } else if (result.user.role === 'assistant') {
        router.push('/assistant')
      } else {
        // في حال وجود أدوار أخرى مستقبلاً مثل صيدلي أو مدير مالي
        router.push('/')
      }

    } catch (error: any) {
      console.error('Login Error:', error)
      setErrorMessage(error.message || 'حدث خطأ غير متوقع أثناء الاتصال بالخادم.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-right font-sans antialiased flex flex-col justify-between p-6 relative overflow-hidden" style={{ direction: 'rtl' }}>
      
      {/* تأثير خلفية مضيئة شبكية */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
      
      {/* الهيدر العلوي: يحتوي على زر العودة لصفحة الاستكشاف (Explorer) */}
      <div className="w-full max-w-md mx-auto flex justify-between items-center z-10">
        <div className="flex items-center gap-2 text-white">
          <HeartPulse className="h-5 w-5 text-blue-500 animate-pulse" />
          <span className="font-black text-xs tracking-tight">PediaCare System</span>
        </div>

        {/* 🧭 الزر المطلوب لاستدعاء صفحة الـ Explorer */}
        <button 
          onClick={() => router.push('/')}
          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-500 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all"
        >
          <LayoutGrid className="h-3.5 w-3.5 text-blue-400" />
          <span>مستكشف الصفحات</span>
        </button>
      </div>

      {/* كارت نموذج تسجيل الدخول */}
      <div className="w-full max-w-md mx-auto bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-blue-950/20 z-10 my-auto">
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-xl font-black text-white tracking-tight">تسجيل الدخول للمنظومة</h1>
          <p className="text-slate-400 text-xs">أدخل بيانات الحساب الخاص بك للولوج إلى لوحة التحكم</p>
        </div>

        {/* عرض رسائل الخطأ إن وجدت */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 text-xs text-rose-400 animate-fadeIn">
            <ShieldAlert className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
            <p className="font-medium leading-relaxed">{errorMessage}</p>
          </div>
        )}

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          
          {/* حقل اسم المستخدم أو البريد */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold text-[11px]">اسم المستخدم أو البريد الإلكتروني:</label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"><User className="h-4 w-4" /></span>
              <input 
                type="text"
                required
                disabled={isLoading}
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-600 rounded-xl py-2.5 pr-10 pl-4 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors font-mono text-left"
                placeholder="e.g. doctor or assistant"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          {/* حقل كلمة المرور */}
          <div className="space-y-1.5">
            <label className="block text-slate-300 font-bold text-[11px]">كلمة المرور السرية:</label>
            <div className="relative">
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500"><Lock className="h-4 w-4" /></span>
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                disabled={isLoading}
                className="w-full bg-slate-900 border border-slate-800 focus:border-blue-600 rounded-xl py-2.5 pr-10 pl-10 text-xs text-white placeholder-slate-600 focus:outline-none transition-colors font-mono text-left"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* زر تقديم النموذج والتحميل */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black text-xs py-3 rounded-xl shadow-lg shadow-blue-600/10 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>جاري التحقق من الهوية...</span>
              </>
            ) : (
              <span>تسجيل الدخول الآمن</span>
            )}
          </button>

        </form>
      </div>

      {/* الفوتر السفلي */}
      <div className="w-full text-center text-[10px] text-slate-600 font-bold z-10">
        <p>جميع الحقوق محفوظة للمنظومة الطبية الذكية © {new Date().getFullYear()}</p>
      </div>

    </div>
  )
}
