'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPinModal, setShowPinModal] = useState(false)
  const [pinCode, setPinCode] = useState('')

  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password })
      })

      const res = await response.json()

      if (response.ok && res.success) {
        if (res.user.role === 'doctor') {
          router.push('/doctor')
        } else if (res.user.role === 'assistant') {
          router.push('/assistant')
        } else {
          router.push('/admin')
        }
      } else {
        setError(res.error || 'بيانات الدخول غير صحيحة')
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع أثناء تسجيل الدخول')
    } finally {
      setLoading(false)
    }
  }

  const handleExportHTML = () => {
    if (pinCode !== '2026') {
      alert('الرمز السري غير صحيح!')
      return
    }

    try {
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head>
            <meta charset="UTF-8">
            <title>PediaCare Backup</title>
            <style>body { font-family: monospace; background: #1e1e1e; color: #d4d4d4; padding: 20px; }</style>
        </head>
        <body>
            <h1>📦 PediaCare Full Project Export Backup</h1>
            <p>تاريخ التصدير: ${new Date().toLocaleDateString('ar-EG')}</p>
        </body>
        </html>
      `
      const blob = new Blob([htmlContent], { type: 'text/html' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'pediaCare-backup-project.html'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setShowPinModal(false)
      setPinCode('')
      alert('تم تصدير ملف الأكواد بنجاح!')
    } catch (err) {
      alert('حدث خطأ أثناء محاولة التصدير.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 relative" style={{ direction: 'rtl', textAlign: 'right' }}>
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-800">بوابة دخول PediaCare</h2>
          <p className="text-slate-400 text-xs">نظام الإدارة الآمن لعيادات طب الأطفال</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold border border-rose-100">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">اسم المستخدم أو البريد الإلكتروني</label>
            <input 
              type="text" required
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="doctor أو assistant"
              value={identifier} onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">كلمة المرور</label>
            <input 
              type="password" required
              className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white p-3 rounded-xl font-bold text-sm transition-all"
          >
            {loading ? 'جاري التحقق الرقمي...' : 'تسجيل الدخول للنظام'}
          </button>
        </form>
      </div>

      <div className="absolute bottom-4 left-4 z-50">
        <button
          onClick={() => setShowPinModal(true)}
          className="bg-slate-800 hover:bg-slate-900 text-slate-200 px-3 py-2 rounded-xl text-xs font-bold transition-all"
        >
          تصدير ملف المشروع (export.html)
        </button>
      </div>

      {showPinModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm space-y-4">
            <div className="text-center">
              <h3 className="font-bold text-slate-800 text-base">تحقق الأمان (Security PIN)</h3>
            </div>
            <input 
              type="password" 
              className="w-full p-3 text-center rounded-xl border font-bold text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••"
              maxLength={4}
              value={pinCode}
              onChange={(e) => setPinCode(e.target.value)}
            />
            <div className="flex gap-2 text-xs font-bold pt-2">
              <button onClick={() => { setShowPinModal(false); setPinCode(''); }} className="flex-1 py-2.5 border rounded-xl text-slate-500 hover:bg-slate-50">إلغاء</button>
              <button onClick={handleExportHTML} className="flex-1 py-2.5 bg-slate-800 text-white rounded-xl">تأكيد وتحميل</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
