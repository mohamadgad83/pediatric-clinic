'use client'

import { useState } from 'react'
import { 
  Users, Plus, Trash2, Clock, CheckCircle, 
  Printer, Save, UserCheck, FileText, Sparkles,
  User, Activity, Stethoscope, Clipboard, HeartPulse
} from 'lucide-react'

// بيانات تجريبية أولية لقائمة الانتظار
const initialQueue = [
  { id: 1, name: "يوسف أحمد محمود", age: "سنتان", type: "كشف جديد", time: "10:30 ص" },
  { id: 2, name: "فاطمة عمر إبراهيم", age: "5 سنوات", type: "إعادة واستشارة", time: "10:45 ص" },
  { id: 3, name: "آدم مصطفى كريم", age: "8 أشهر", type: "كشف جديد", time: "11:00 ص" },
]

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState<'queue' | 'patients' | 'billing'>('queue')
  const [queue, setQueue] = useState(initialQueue)
  const [currentPatient, setCurrentPatient] = useState<typeof initialQueue[0] | null>(null)
  
  // حالات نموذج الكشف الطبي للطفل
  const [complaint, setComplaint] = useState('')
  const [examination, setExamination] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [prescription, setPrescription] = useState('')

  // دالة بدء الكشف الطبي على طفل معين
  const handleStartExamination = (patient: typeof initialQueue[0]) => {
    setCurrentPatient(patient)
    // تنظيف النموذج للطفل الجديد
    setComplaint('')
    setExamination('')
    setDiagnosis('')
    setPrescription('')
  }

  // دالة إنهاء وحفظ الكشف الطبي وطباعة الروشتة
  const handleSaveMedicalRecord = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPatient) return

    alert(`تم حفظ الملف الطبي للطفل: ${currentPatient.name} بنجاح وجاهز للطباعة!`)
    
    // إزالة الطفل من قائمة الانتظار بعد إنهاء الكشف
    setQueue(queue.filter(p => p.id !== currentPatient.id))
    setCurrentPatient(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-right p-4 md:p-6" style={{ direction: 'rtl' }}>
      
      {/* الهيدر العلوي */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">غرفة الطبيب الشخصية</h1>
            <p className="text-slate-400 text-xs">نظام PediaCare الشامل للفحص الطبي والروشتة الرقمية</p>
          </div>
        </div>
        <div className="bg-blue-50 px-4 py-2 rounded-xl text-blue-700 font-bold text-xs border border-blue-100">
          د. محمد جاد | طبيب الأطفال الاستشاري
        </div>
      </header>

      {/* لوحة الإحصائيات السريعة */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold">إجمالي أطفال اليوم</p>
            <h3 className="text-2xl font-black text-slate-800 mt-1">{queue.length + 5}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Users className="h-6 w-6" /></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold">حالات في الانتظار</p>
            <h3 className="text-2xl font-black text-amber-600 mt-1">{queue.length}</h3>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock className="h-6 w-6" /></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold">تم الكشف عليهم</p>
            <h3 className="text-2xl font-black text-emerald-600 mt-1">5 أطفال</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle className="h-6 w-6" /></div>
        </div>
      </div>

      {/* أزرار التنقل الرئيسية بين الأقسام */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('queue')}
          className={`p-4 rounded-xl flex items-center gap-3 border transition-all ${activeTab === 'queue' ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          <Clock className="h-5 w-5" />
          <span className="font-bold text-sm">قائمة الفحص والانتظار النشطة</span>
        </button>

        <button 
          onClick={() => setActiveTab('patients')}
          className={`p-4 rounded-xl flex items-center gap-3 border transition-all ${activeTab === 'patients' ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          <User className="h-5 w-5" />
          <span className="font-bold text-sm">الأرشيف والسجلات المرضية العامة</span>
        </button>

        <button 
          onClick={() => setActiveTab('billing')}
          className={`p-4 rounded-xl flex items-center gap-3 border transition-all ${activeTab === 'billing' ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
        >
          <FileText className="h-5 w-5" />
          <span className="font-bold text-sm">تقارير الحسابات والعيادة اليومية</span>
        </button>
      </div>

      {/* محتوى القسم النشط */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200/60 shadow-sm min-h-[450px]">
        
        {activeTab === 'queue' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* العمود الأيمن: قائمة الحالات المنتظرة */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="font-bold text-slate-700 pb-2 border-b flex items-center gap-2 text-sm text-blue-600">
                <UserCheck className="h-5 w-5" /> أطفال في الانتظار بالخارج
              </h3>
              {queue.length === 0 ? (
                <p className="text-slate-400 text-xs py-4 text-center">لا توجد حالات منتظرة حالياً في الخارج.</p>
              ) : (
                <div className="space-y-3">
                  {queue.map((patient) => (
                    <div 
                      key={patient.id} 
                      className={`p-4 rounded-xl border transition-all ${currentPatient?.id === patient.id ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500' : 'border-slate-100 bg-slate-50 hover:bg-slate-100'}`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{patient.name}</h4>
                          <p className="text-slate-400 text-xs mt-1">العمر: {patient.age} | النوع: <span className="text-blue-600 font-semibold">{patient.type}</span></p>
                        </div>
                        <span className="bg-white text-slate-500 px-2 py-0.5 rounded-md text-[10px] border font-bold">{patient.time}</span>
                      </div>
                      <button
                        onClick={() => handleStartExamination(patient)}
                        className="w-full mt-3 bg-white hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                      >
                        <Stethoscope className="h-3.5 w-3.5" /> الكشف على الطفل الآن
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* العمود الأيسر: استمارة الفحص الطبي والروشتة الدوائية */}
            <div className="lg:col-span-2 border-r pr-0 lg:pr-6 border-slate-100">
              <h3 className="font-bold text-slate-700 pb-2 border-b flex items-center gap-2 text-sm text-emerald-600">
                <HeartPulse className="h-5 w-5" /> استمارة التشخيص الحالية والروشتة الإلكترونية
              </h3>

              {currentPatient ? (
                <form onSubmit={handleSaveMedicalRecord} className="mt-4 space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-700">يجري فحص الطفل حالياً: <strong className="text-blue-600">{currentPatient.name}</strong></span>
                    <span className="text-slate-500">السن: {currentPatient.age}</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                      <Activity className="h-3.5 w-3.5 text-blue-500" /> شكوى المريض والأعراض الحالية (Chief Complaint)
                    </label>
                    <textarea 
                      rows={2} required
                      className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-left" style={{ direction: 'ltr' }}
                      placeholder="e.g., Fever for 3 days, persistent dry cough, vomiting..."
                      value={complaint} onChange={(e) => setComplaint(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                        <Stethoscope className="h-3.5 w-3.5 text-blue-500" /> الفحص الإكلينيكي والعلامات (Examination)
                      </label>
                      <textarea 
                        rows={2}
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-left" style={{ direction: 'ltr' }}
                        placeholder="e.g., Chest: clear, Tonsils: congested, Temp: 38.5C"
                        value={examination} onChange={(e) => setExamination(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1">
                        <Clipboard className="h-3.5 w-3.5 text-blue-500" /> التشخيص الطبي المقترح (Diagnosis)
                      </label>
                      <textarea 
                        rows={2} required
                        className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 text-left" style={{ direction: 'ltr' }}
                        placeholder="e.g., Acute Tonsillitis / Gastroenteritis"
                        value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1 text-emerald-600">
                      <Printer className="h-3.5 w-3.5" /> الروشتة الدوائية المطبوعة (Rx - Prescription)
                    </label>
                    <textarea 
                      rows={4} required
                      className="w-full p-3 rounded-xl border border-emerald-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono text-left bg-emerald-50/10" style={{ direction: 'ltr' }}
                      placeholder="1- Zithromax 200mg/5ml susp. (5ml OD for 3 days)&#10;2- Cetal Drops (15 drops q6h when needed)"
                      value={prescription} onChange={(e) => setPrescription(e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button 
                      type="button" onClick={() => setCurrentPatient(null)}
                      className="px-4 py-2.5 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors"
                    >
                      إلغاء الفحص
                    </button>
                    <button 
                      type="submit"
                      className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" /> حفظ الروشتة وإنهاء الحالة
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-slate-300">
                  <Stethoscope className="h-16 w-16 mb-2 stroke-1" />
                  <p className="text-xs font-bold">يرجى اختيار طفل من قائمة الانتظار للبدء في كتابة الروشتة والتشخيص</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 border-b pb-2 flex items-center gap-2 text-sm text-blue-600">
              <Users className="h-5 w-5" /> أرشيف البحث عن الأطفال المترددين على العيادة
            </h3>
            <div className="flex gap-2">
              <input type="text" className="p-2.5 rounded-xl border text-xs w-full max-w-sm focus:outline-none" placeholder="اكتب اسم الطفل أو رقم هاتف ولي الأمر..." />
              <button className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">بحث في السجلات</button>
            </div>
            <p className="text-slate-400 text-xs pt-2">هذا المجلد يحتوي على كامل التاريخ الطبي لروشتات الأطفال السابقة لمتابعة تطور الحالات.</p>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 border-b pb-2 flex items-center gap-2 text-sm text-blue-600">
              <Printer className="h-5 w-5" /> تقرير الحسابات المجمعة اليومي
            </h3>
            <p className="text-slate-400 text-xs">إجمالي الإيرادات المسجلة عن طريق المساعد في الخارج الخاصة بالكشوفات والاستشارات اليومية.</p>
            <div className="p-4 bg-slate-50 rounded-xl border max-w-xs space-y-2 text-xs font-bold">
              <div className="flex justify-between text-slate-600"><span>كشوفات اليوم:</span><span>500 ج.م</span></div>
              <div className="flex justify-between text-slate-600"><span>استشارات اليوم:</span><span>100 ج.م</span></div>
              <div className="flex justify-between text-slate-800 border-t pt-2 text-sm"><span>الإجمالي الصافي:</span><span className="text-emerald-600">600 ج.م</span></div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
