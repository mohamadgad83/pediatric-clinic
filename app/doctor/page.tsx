'use client'

import { useState } from 'react'
import { 
  Users, 
  Plus, 
  Trash2, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Printer, 
  Save, 
  UserCheck, 
  FileText,
  Sparkles
} from 'lucide-react'

export default function DoctorDashboard() {
  // تم تنظيف الأيقونة المفقودة واستبدالها بـ FileText المستقرة والمدعومة تماماً
  const [activeTab, setActiveTab] = useState<'queue' | 'patients' | 'billing'>('queue')

  return (
    <div className="min-h-screen bg-slate-50 text-right p-6" style={{ direction: 'rtl' }}>
      <header className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">لوحة تحكم الطبيب</h1>
            <p className="text-slate-400 text-xs">إدارة الكشف الطبي والمتابعة الرقمية للأطفال</p>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('queue')}
          className={`p-4 rounded-xl flex items-center gap-3 border transition-all ${activeTab === 'queue' ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          <Clock className="h-5 w-5" />
          <span className="font-bold text-sm">قائمة الانتظار اليومية</span>
        </button>

        <button 
          onClick={() => setActiveTab('patients')}
          className={`p-4 rounded-xl flex items-center gap-3 border transition-all ${activeTab === 'patients' ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          <Users className="h-5 w-5" />
          <span className="font-bold text-sm">سجلات المرضى والأطفال</span>
        </button>

        <button 
          onClick={() => setActiveTab('billing')}
          className={`p-4 rounded-xl flex items-center gap-3 border transition-all ${activeTab === 'billing' ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          <FileText className="h-5 w-5" />
          <span className="font-bold text-sm">الفواتير والتقارير المالية</span>
        </button>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200/60 shadow-sm min-h-[400px]">
        {activeTab === 'queue' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 border-b pb-2 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-blue-600" /> حالات الانتظار النشطة الحالية
            </h3>
            <p className="text-slate-400 text-sm">لا توجد حالات في قائمة الانتظار حالياً.</p>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 border-b pb-2 flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" /> البحث في سجلات عيادة الأطفال
            </h3>
            <p className="text-slate-400 text-sm">قم بالبحث عن ملف المريض لعرض التاريخ المرضي والروشتات السابقة.</p>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 border-b pb-2 flex items-center gap-2">
              <Printer className="h-5 w-5 text-blue-600" /> طباعة فواتير الكشف والمتابعة
            </h3>
            <p className="text-slate-400 text-sm">تقارير الحسابات اليومية والإيرادات الشاملة للعيادة.</p>
          </div>
        )}
      </div>
    </div>
  )
}
