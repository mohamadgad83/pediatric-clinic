'use client'

import { useRouter } from 'next/navigation'
import { 
  Stethoscope, UserCheck, DollarSign, History, 
  ArrowLeft, ShieldAlert, Activity, LayoutGrid 
} from 'lucide-react'

export default function ClinicExplorer() {
  const router = useRouter()

  // مصفوفة الصفحات المتاحة في النظام لربطها بالكامل
  const systemModules = [
    {
      title: "غرفة الفحص الحية (الطبيب)",
      desc: "لوحة تحكم الطبيب للكشف، فحص السوابق المرضية، واحتساب جرعات الأدوية التلقائية وطباعة الروشتة.",
      icon: <Stethoscope className="h-6 w-6 text-blue-600" />,
      path: "/doctor",
      color: "border-blue-100 hover:border-blue-500 bg-blue-50/20"
    },
    {
      title: "مكتب السكرتارية والمساعد",
      desc: "استقبال الأطفال، تسجيل المؤشرات الحيوية الابتدائية (الوزن، الطول، الحرارة) وإدارة قائمة الانتظار الحية.",
      icon: <UserCheck className="h-6 w-6 text-emerald-600" />,
      path: "/assistant",
      color: "border-emerald-100 hover:border-emerald-500 bg-emerald-50/20"
    },
    {
      title: "الحسابات والميزانية اليومية",
      desc: "الإيرادات التلقائية، إدراج المصروفات والنثريات، حساب صافي الأرباح، والتقارير المالية التحليلية.",
      icon: <DollarSign className="h-6 w-6 text-amber-600" />,
      path: "/financials",
      color: "border-amber-100 hover:border-amber-500 bg-amber-50/20"
    },
    {
      title: "أرشيف السجلات الطبية",
      desc: "البحث المتقدم في ملفات المرضى التاريخية بالاسم، رقم الهاتف، أو الفلترة بناءً على تشخيص طبي معين.",
      icon: <History className="h-6 w-6 text-purple-600" />,
      path: "/archive",
      color: "border-purple-100 hover:border-purple-500 bg-purple-50/20"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-right font-sans antialiased text-slate-800" style={{ direction: 'rtl' }}>
      
      {/* هيدر الصفحة والترحيب */}
      <div className="bg-slate-950 text-white py-12 px-6 border-b border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div>
            <span className="bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20">منظومة العيادة الذكية الموحدة v2.0</span>
            <h1 className="text-2xl md:text-3xl font-black mt-2 tracking-tight">مستكشف صفحات وموديولات النظام (System Explorer)</h1>
            <p className="text-slate-400 text-xs mt-1">بوابة التحكم المركزية والربط الديناميكي بين العيادة، السكرتارية، والخزينة الماليّة</p>
          </div>

          {/* الزر الرئيسي لربط صفحة تسجيل الدخول */}
          <button 
            onClick={() => router.push('/login')}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-lg shadow-blue-600/20 flex items-center gap-2 transition-all group"
          >
            <span>الانتقال لصفحة تسجيل الدخول</span>
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          </button>
        </div>
      </div>

      {/* شبكة عرض كروت الصفحات والموديولات المقترحة */}
      <div className="max-w-6xl mx-auto p-6 md:py-12">
        <div className="flex items-center gap-2 mb-6 border-b pb-3">
          <LayoutGrid className="h-5 w-5 text-slate-400" />
          <h2 className="font-black text-sm text-slate-700">اقسام المنظومة الطبية المتاحة للتشغيل السريع:</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {systemModules.map((module, idx) => (
            <div 
              key={idx} 
              className={`p-6 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex flex-col justify-between group hover:shadow-md ${module.color}`}
              onClick={() => router.push(module.path)}
            >
              <div className="space-y-3">
                <div className="p-3 bg-white rounded-xl w-fit shadow-sm border border-slate-100">
                  {module.icon}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">{module.title}</h3>
                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{module.desc}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100/60 flex justify-end items-center text-[11px] font-bold text-blue-600 gap-1">
                <span>فتح الموديول الفني</span>
                <ArrowLeft className="h-3 w-3" />
              </div>
            </div>
          ))}
        </div>

        {/* شريط الأمان التنبيهي أسفل المستكشف */}
        <div className="mt-12 p-4 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
          <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-bold">ملاحظة أمنية حول الصلاحيات:</strong>
            <p className="mt-0.5 text-amber-800/90 leading-relaxed">هذه الصفحة تظهر حالياً لتسهيل التنقل البرمجي ومراجعة الـ UI أثناء التطوير. في البيئة الإنتاجية الحقيقية (Production)، يتم توجيه المستخدم تلقائياً إلى صفحة `/login` وتوزيع الصلاحيات عبر الـ Middleware بناءً على دور المستخدم (Doctor / Assistant).</p>
          </div>
        </div>
      </div>

    </div>
  );
}
