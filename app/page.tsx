'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  FolderDown, FileText, Code2, LayoutGrid, 
  ArrowLeft, ShieldCheck, AlertCircle 
} from 'lucide-react'

export default function ExplorerAndExportPage() {
  const router = useRouter()
  
  // حالات التحكم الخاصة بأداة التصدير والتوثيق التلقائي
  const [includeDocs, setIncludeDocs] = useState(true)
  const [includeCode, setIncludeCode] = useState(true)
  const [statusText, setStatusText] = useState('⏳ جاهز للتصدير والملاحة')
  const [statusClass, setStatusClass] = useState('text-slate-500')
  const [isExporting, setIsExporting] = useState(false)

  // نص التوثيق المدمج كما هو في ملفك الأصلي
  const DOCUMENTATION_CONTENT = `
========================================
📚 توثيق مشروع PediaCare
========================================

🏥 PediaCare – نظام إدارة عيادات الأطفال
----------------------------------------
نظام متكامل لإدارة عيادات الأطفال، مبني باستخدام Next.js 14 و Supabase،
مع نظام مصادقة مستقل يعتمد على clinic_profiles.

🔗 الروابط المهمة
-----------------
التطبيق: https://pediatric-clinic-psi.vercel.app
GitHub: https://github.com/mohamadgad83/pediatric-clinic
Supabase: https://app.supabase.com/project/cuchwughgvhiwgaoodib
  `;

  // قائمة الملفات المطلوب تصديرها من السكريبت الخاص بك
  const FILES_TO_EXPORT = [
    { path: 'app/api/login/route.ts' },
    { path: 'app/assistant/page.tsx' },
    { path: 'app/assistant/patients/page.tsx' },
    { path: 'app/assistant/patients/new/page.tsx' },
    { path: 'app/assistant/queue/page.tsx' },
    { path: 'app/doctor/page.tsx' },
    { path: 'app/doctor/patients/page.tsx' },
    { path: 'app/doctor/patients/[id]/page.tsx' },
    { path: 'app/doctor/queue/page.tsx' },
    { path: 'app/login/page.tsx' },
    { path: 'app/layout.tsx' },
    { path: 'app/page.tsx' },
    { path: 'app/globals.css' },
    { path: 'hooks/useAuth.ts' },
    { path: 'lib/supabase.ts' },
    { path: 'middleware.ts' },
    { path: 'package.json' },
    { path: 'next.config.js' },
    { path: 'tailwind.config.js' },
    { path: 'postcss.config.js' },
    { path: 'tsconfig.json' }
  ];

  // دالة معالجة التصدير التلقائي وحفظ الملف النصي الجامع
  const handleExportSystem = async () => {
    setIsExporting(true)
    setStatusText('⏳ جاري جمع وتنزيل ملفات المنظومة الطبية...')
    setStatusClass('text-blue-500 font-bold')

    let fullContent = '# 📦 PediaCare - Full Project Code + Documentation\n\n'
    fullContent += `Generated on: ${new Date().toLocaleString('ar-EG')}\n`
    fullContent += '============================================================\n\n'

    let fileCount = 0
    let missingCount = 0

    try {
      if (includeCode) {
        fullContent += '# 💻 Project Code\n\n'
        const baseURL = 'https://raw.githubusercontent.com/mohamadgad83/pediatric-clinic/main/'

        for (const file of FILES_TO_EXPORT) {
          setStatusText(`⏳ جاري جلب وقراءة: ${file.path}`)
          try {
            const res = await fetch(baseURL + file.path)
            if (res.ok) {
              const content = await res.text()
              fullContent += `📁 FILE: ${file.path}\n`
              fullContent += '============================================================\n'
              fullContent += content
              fullContent += '\n\n============================================================\n\n'
              fileCount++
            } else {
              fullContent += `📁 FILE: ${file.path} (⚠️ غير موجود)\n`
              fullContent += '============================================================\n❌ الملف غير موجود بالخادم الرقمي\n\n'
              missingCount++
            }
          } catch (e: any) {
            fullContent += `📁 FILE: ${file.path} (⚠️ خطأ اتصال)\n`
            fullContent += `❌ خطأ: ${e.message}\n\n`
            missingCount++
          }
        }
      }

      if (includeDocs) {
        fullContent += '\n\n' + DOCUMENTATION_CONTENT
      }

      // إتمام الحفظ والتحميل للمستخدم
      const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `pediaCare-full-${new Date().toISOString().slice(0, 10)}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      let msg = `✅ تم التصدير بنجاح! (${fileCount} ملف مفعل`
      if (missingCount > 0) msg += `، و ${missingCount} ملفات مفقودة`
      msg += ` - الحجم: ${Math.round(blob.size / 1024)} KB)`
      
      setStatusText(msg)
      setStatusClass('text-emerald-500 font-black')
    } catch (error: any) {
      setStatusText(`❌ فشل التصدير: ${error.message}`)
      setStatusClass('text-rose-500 font-bold')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 text-right font-sans antialiased flex flex-col justify-between p-4 md:p-8" style={{ direction: 'rtl' }}>
      
      {/* شبكة الخلفية الجمالية */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>

      {/* لوحة التحكم المركزية وبوابة التصدير والملاحة */}
      <div className="w-full max-w-4xl mx-auto bg-slate-950 border border-slate-800 rounded-3xl p-6 md:p-10 shadow-2xl shadow-blue-950/40 my-auto z-10 space-y-8">
        
        {/* هيدر ترحيبي بالنظام */}
        <div className="text-center space-y-2 border-b border-slate-800 pb-6">
          <div className="inline-flex p-3 bg-blue-600/10 rounded-2xl border border-blue-500/20 text-blue-400 mb-2">
            <LayoutGrid className="h-6 w-6" />
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">📦 مستكشف ومنظومة ترحيل الأكواد PediaCare</h1>
          <p className="text-slate-400 text-xs md:text-sm">بوابة تصفح الموديولات الحية المربوطة وضغط شجرة المشروع وتوثيق الجداول في ملف واحد</p>
        </div>

        {/* شبكة أزرار الانتقال الفوري والملاحة المطلوبة */}
        <div className="space-y-3">
          <h3 className="text-white font-bold text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>الانتقال الفوري إلى موديولات النظام الفعالة:</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => router.push('/login')}
              className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-blue-600 rounded-2xl text-right transition-all group flex flex-col justify-between"
            >
              <span className="font-bold text-xs text-white group-hover:text-blue-400 transition-colors">بوابة الحماية وتسجيل الدخول</span>
              <span className="text-[11px] text-slate-500 mt-1">توجيه ذكي للطبيب والمساعد عبر الجلسات المفتوحة والـ Cookies</span>
            </button>
            <button 
              onClick={() => router.push('/doctor')}
              className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-violet-600 rounded-2xl text-right transition-all group flex flex-col justify-between"
            >
              <span className="font-bold text-xs text-white group-hover:text-violet-400 transition-colors">لوحة فحص الطبيب</span>
              <span className="text-[11px] text-slate-500 mt-1">غرفة الفحص الحية، التاريخ المرضي، واحتساب الجرعات الدوائية</span>
            </button>
            <button 
              onClick={() => router.push('/assistant')}
              className="p-4 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-emerald-600 rounded-2xl text-right transition-all group flex flex-col justify-between"
            >
              <span className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors">مكتب الاستقبال والسكرتارية</span>
              <span className="text-[11px] text-slate-500 mt-1">إضافة المرضى الجدد، قياس المؤشرات، وإدارة طابور الانتظار بالثانية</span>
            </button>
          </div>
        </div>

        {/* أدوات وأزرار التصدير البرمجي المستوحى من كودك الأصلي */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 md:p-6 space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h4 className="text-white font-bold text-xs">أداة حزم وتصدير الأكواد والتراكيب (Export Bundle)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">يقوم بسحب أحدث الأكواد من السيرفر وبناء ملف نصي موحد وشامل للهندسة العكسية والمراجعة</p>
            </div>
            
            {/* اختيارات التضمين */}
            <div className="flex gap-4">
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={includeDocs} 
                  onChange={(e) => setIncludeDocs(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer" 
                />
                <FileText className="h-3.5 w-3.5 text-slate-400" />
                <span>تضمين التوثيق والجداول</span>
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={includeCode} 
                  onChange={(e) => setIncludeCode(e.target.checked)}
                  className="w-4 h-4 accent-blue-600 cursor-pointer" 
                />
                <Code2 className="h-3.5 w-3.5 text-slate-400" />
                <span>تضمين شجرة الأكواد</span>
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 border-t border-slate-800/60">
            <button
              onClick={handleExportSystem}
              disabled={isExporting || (!includeCode && !includeDocs)}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-500/10 flex items-center justify-center gap-2 transition-all disabled:opacity-40"
            >
              <FolderDown className="h-4 w-4" />
              <span>{isExporting ? 'جاري تجميع الملفات الحية...' : 'بدء تصدير وحزم الأكواد الموحدة'}</span>
            </button>
            
            {/* نص الحالة التفاعلي المطابق لطلبك */}
            <div className={`text-xs ${statusClass} tracking-wide text-center sm:text-right`}>
              {statusText}
            </div>
          </div>
        </div>

        {/* تنبيه حول بنية الصلاحيات */}
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-400">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <p className="leading-relaxed"><strong>تنبيه بيئة العمل:</strong> مستكشف المسارات متاح حالياً لتسهيل التطوير والانتقال الهندسي الفوري ومتابعة واجهات لوحة الطبيب والسكرتارية المحدثة. عند النشر النهائي، سيتم تحويل الزوار تلقائياً لبوابة الحماية والـ Login.</p>
        </div>

      </div>

      {/* فوتر النظام المحدث */}
      <div className="w-full text-center text-[10px] text-slate-600 font-bold mt-4">
        <p>منظومة عيادات الأطفال المتكاملة PediaCare • Next.js 14 Framework • جميع الحقوق محفوظة © {new Date().getFullYear()}</p>
      </div>

    </div>
  )
}
