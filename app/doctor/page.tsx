'use client'

import { useState, useEffect } from 'react'
import { 
  getTodayQueue, 
  updateAppointmentStatus, 
  saveMedicalConsultation 
} from '@/app/actions/clinicActions'
import { 
  UserCheck, 
  Users, 
  CheckCircle, 
  Clock, 
  FileText, 
  FileHeart, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle,
  Printer,
  Sparkles
} from 'lucide-react'

interface Patient {
  id: string
  name: string
  gender: string
  birth_date: string
  parent_phone: string
}

interface Appointment {
  id: string
  patient_id: string
  visit_date: string
  status: string
  queue_number: number
  notes: string
  weight?: number
  height?: number
  temperature?: number
  clinic_patients: Patient | null
}

interface Medication {
  name: string
  dosage: string    // جرعة محددة: مثل 5 مل
  frequency: string // تكرار: مثل كل 8 ساعات
  duration: string  // مدة: مثل 5 أيام
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'waiting' | 'completed'>('waiting')
  
  // حالات الكشف الحالي النشط
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null)
  const [diagnosis, setDiagnosis] = useState('')
  const [doctorNotes, setDoctorNotes] = useState('')
  const [medications, setMedications] = useState<Medication[]>([])
  const [newMed, setNewMed] = useState<Medication>({ name: '', dosage: '', frequency: '', duration: '' })
  const [customFields, setCustomFields] = useState<{ [key: string]: string }>({})
  const [isSaving, setIsSaving] = useState(false)

  // جلب الطابور اليومي الآمن من السيرفر
  const fetchQueueData = async () => {
    setLoading(true)
    const res = await getTodayQueue()
    if (res.success && res.data) {
      setAppointments(res.data as any)
    } else {
      console.error(res.error)
      alert('فشل في جلب البيانات بطريقة آمنة: ' + res.error)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchQueueData()
  }, [])

  // دالة حساب عمر الطفل الطبية الدقيقة (بالأيام والشهور والسنوات)
  const calculatePediatricAge = (birthDateString: string) => {
    if (!birthDateString) return 'غير مسجل'
    const birthDate = new Date(birthDateString)
    const today = new Date()

    let years = today.getFullYear() - birthDate.getFullYear()
    let months = today.getMonth() - birthDate.getMonth()
    let days = today.getDate() - birthDate.getDate()

    if (days < 0) {
      months--
      const lastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
      days += lastMonth.getDate()
    }

    if (months < 0) {
      years--
      months += 12
    }

    if (years === 0 && months === 0) return `${days} يوم (حديث الولادة)`
    if (years === 0) return `${months} شهر و ${days} يوم`
    return `${years} سنة و ${months} شهر`
  }

  const filteredAppointments = appointments.filter(app => {
    if (activeTab === 'waiting') return app.status === 'waiting' || app.status === 'checking'
    return app.status === 'completed'
  })

  // بدء كشف طبي جديد وحفظ الحالة في السيرفر
  const handleStartConsultation = async (appointment: Appointment) => {
    setCurrentAppointment(appointment)
    setDiagnosis('')
    setDoctorNotes('')
    setMedications([])
    setCustomFields({})
    
    // تحديث الحالة على السيرفر لتصبح "جاري الفحص"
    await updateAppointmentStatus(appointment.id, 'checking')
    // تحديث الحالة محلياً فقط للمظهر دون الحاجة لعمل رندر كامل
    setAppointments(prev => prev.map(a => a.id === appointment.id ? { ...a, status: 'checking' } : a))
  }

  // إضافة دواء مهيكل للروشتة
  const handleAddMedication = () => {
    if (!newMed.name.trim() || !newMed.dosage.trim()) {
      alert('يرجى كتابة اسم الدواء والجرعة على الأقل لضمان سلامة الطفل.')
      return
    }
    setMedications([...medications, newMed])
    setNewMed({ name: '', dosage: '', frequency: '', duration: '' })
  }

  // حذف دواء من الروشتة
  const handleRemoveMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  // حفظ الكشف وإنهاء الجلسة بأمان تام
  const handleSaveAndComplete = async () => {
    if (!currentAppointment) return
    if (!diagnosis.trim()) {
      alert('التشخيص الطبي حقل إلزامي لإنهاء حالة الطفل.')
      return
    }

    setIsSaving(true)
    const result = await saveMedicalConsultation({
      appointmentId: currentAppointment.id,
      patientId: currentAppointment.patient_id,
      diagnosis,
      notes: doctorNotes,
      prescriptions: medications,
      customFields
    })

    if (result.success) {
      alert('تم حفظ السجل الطبي والروشتة بنجاح كامل على السيرفر الآمن!')
      // تفعيل ميزة الطباعة التلقائية الفورية للروشتة إذا أردت
      window.print() 
      setCurrentAppointment(null)
      fetchQueueData()
    } else {
      alert('خطأ أثناء حفظ الكشف: ' + result.error)
    }
    setIsSaving(false)
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-right" dir="rtl">
      
      {/* الجزء العلوي - ترويسة اللوحة والعدادات */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 print:hidden">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="text-blue-600 h-8 w-8" /> لوحة تحكم الطبيب المؤمنة <Sparkles className="text-amber-500 h-5 w-5" />
          </h1>
          <p className="text-slate-500 mt-1 text-sm">تدار هذه اللوحة بالكامل عبر خوادم آمنة (Server Actions) لحماية البيانات الطبية.</p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 flex-1 md:flex-initial">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Clock /></div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{appointments.filter(a => a.status !== 'completed').length}</div>
              <div className="text-xs text-slate-400">في الانتظار</div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4 flex-1 md:flex-initial">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><CheckCircle /></div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{appointments.filter(a => a.status === 'completed').length}</div>
              <div className="text-xs text-slate-400">الحالات المكتملة</div>
            </div>
          </div>
        </div>
      </div>

      {/* شاشة العرض الرئيسية لتقسيم الطابور والكشف */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* العمود الأيمن - طابور الأطفال اليومي (مخفي أثناء الطباعة) */}
        <div className="lg:col-span-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 h-fit print:hidden">
          <div className="flex border-b border-slate-100 mb-4">
            <button 
              className={`flex-1 pb-3 font-semibold text-sm transition-all ${activeTab === 'waiting' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}
              onClick={() => setActiveTab('waiting')}
            >
              قائمة الانتظار اليومية
            </button>
            <button 
              className={`flex-1 pb-3 font-semibold text-sm transition-all ${activeTab === 'completed' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}
              onClick={() => setActiveTab('completed')}
            >
              الحالات المكتملة
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-400 animate-pulse">جاري جلب الطابور بأمان...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center gap-2">
              <Users className="h-8 w-8 text-slate-300" />
              <span className="text-sm">لا يوجد أطفال في هذه القائمة حالياً.</span>
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredAppointments.map((app) => (
                <div 
                  key={app.id} 
                  className={`p-4 rounded-xl border transition-all ${currentAppointment?.id === app.id ? 'border-blue-500 bg-blue-50/40 shadow-sm' : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'}`}
                >
                  <div className="flex justify-between items-start">
                    <span className="bg-slate-200 text-slate-700 font-bold px-2.5 py-0.5 rounded-full text-xs">
                      رقم {app.queue_number}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${app.status === 'checking' ? 'bg-amber-100 text-amber-700 animate-pulse' : app.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {app.status === 'checking' ? 'جاري الفحص' : app.status === 'completed' ? 'مكتمل' : 'ينتظر'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 mt-2 text-base">{app.clinic_patients?.name || 'اسم غير معروف'}</h3>
                  <div className="text-xs text-slate-500 space-y-1 mt-1.5">
                    <div>العمر الطبي: {app.clinic_patients?.birth_date ? calculatePediatricAge(app.clinic_patients.birth_date) : 'غير مسجل'}</div>
                    {(app.weight || app.temperature) && (
                      <div className="flex gap-3 text-slate-600 bg-white p-2 rounded border border-slate-100 mt-1.5">
                        {app.weight && <span>الوزن: <b className="text-blue-600">{app.weight} كجم</b></span>}
                        {app.temperature && <span>الحرارة: <b className="text-rose-600">{app.temperature} °م</b></span>}
                      </div>
                    )}
                  </div>
                  
                  {app.status !== 'completed' && currentAppointment?.id !== app.id && (
                    <button 
                      onClick={() => handleStartConsultation(app)}
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <FileHeart className="h-3.5 w-3.5" /> بدء الفحص والروشتة
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* العمود الأيسر - شاشة الفحص ومعاينة المريض الحالي + الروشتة الجاهزة للطباعة */}
        <div className="lg:col-span-2">
          {currentAppointment ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6 print:border-none print:p-0">
              
              {/* قسم بيانات المريض والطفل (يظهر أيضاً في الطباعة كترويسة روشتة) */}
              <div className="border-b-2 border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wide print:hidden">الملف الطبي الحالي للطفل</span>
                  <h2 className="text-2xl font-bold text-slate-800 mt-0.5">{currentAppointment.clinic_patients?.name}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    الجنس: {currentAppointment.clinic_patients?.gender === 'male' ? 'ذكر' : 'أنثى'} | 
                    العمر الحالي: {currentAppointment.clinic_patients?.birth_date && calculatePediatricAge(currentAppointment.clinic_patients.birth_date)}
                  </p>
                </div>
                <div className="text-right text-xs bg-slate-50 p-3 rounded-xl border border-slate-100 min-w-[150px]">
                  <div className="font-semibold text-slate-500">العلامات الحيوية للزيارة:</div>
                  <div className="mt-1 space-y-0.5 font-medium text-slate-700">
                    <div>الحرارة: {currentAppointment.temperature ? `${currentAppointment.temperature} °م` : 'لم تقاس'}</div>
                    <div>الوزن: {currentAppointment.weight ? `${currentAppointment.weight} كجم` : 'لم يقاس'}</div>
                  </div>
                </div>
              </div>

              {/* حقل التشخيص الطبي الرئيسي */}
              <div className="print:block">
                <label className="block text-sm font-semibold text-slate-700 mb-2 print:text-base print:font-bold">التشخيص الطبي (Diagnosis) *</label>
                <textarea 
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm print:border-none print:p-0 print:text-slate-800"
                  placeholder="اكتب التشخيص التفصيلي لحالة الطفل هنا..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              {/* حقل بناء الروشتة العلاجية المهيكلة والمؤمنة */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 space-y-4 print:bg-white print:border-none print:p-0">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 print:text-base print:font-bold">
                  <FileText className="text-blue-600 h-4 w-4 print:hidden" /> العلاجات والأدوية الموصوفة (Prescription)
                </h3>
                
                {/* حقول إدخال الدواء الجديد (تختفي تماماً أثناء الطباعة) */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white p-3 rounded-lg border border-slate-100 print:hidden">
                  <input 
                    type="text" placeholder="اسم الدواء (مثل: Brufen)" 
                    className="p-2 border rounded-lg text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={newMed.name} onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="الجرعة (مثل: 3 مل)" 
                    className="p-2 border rounded-lg text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={newMed.dosage} onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="التكرار (مثل: كل 12 ساعة)" 
                    className="p-2 border rounded-lg text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={newMed.frequency} onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                  />
                  <div className="flex gap-1">
                    <input 
                      type="text" placeholder="المدة (٤ أيام)" 
                      className="p-2 border rounded-lg text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={newMed.duration} onChange={(e) => setNewMed({...newMed, duration: e.target.value})}
                    />
                    <button 
                      type="button" onClick={handleAddMedication}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* جدول عرض الأدوية المنظم والجاهز للطباعة بدقة وسلاسة */}
                {medications.length > 0 ? (
                  <div className="bg-white rounded-lg border border-slate-100 overflow-hidden text-xs print:border-none">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 print:bg-slate-50">
                          <th className="p-2 text-sm">اسم الدواء</th>
                          <th className="p-2 text-sm">الجرعة</th>
                          <th className="p-2 text-sm">التكرار اليومي</th>
                          <th className="p-2 text-sm">المدة</th>
                          <th className="p-2 text-center w-12 print:hidden">حذف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {medications.map((med, index) => (
                          <tr key={index} className="hover:bg-slate-50/80">
                            <td className="p-2 font-bold text-slate-800">{med.name}</td>
                            <td className="p-2 text-slate-700">{med.dosage}</td>
                            <td className="p-2 text-slate-700">{med.frequency}</td>
                            <td className="p-2 text-slate-700">{med.duration}</td>
                            <td className="p-2 text-center print:hidden">
                              <button type="button" onClick={() => handleRemoveMedication(index)} className="text-rose-500 hover:text-rose-700">
                                <Trash2 className="h-3.5 w-3.5 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg bg-white print:hidden">
                    لم تقم بصرف أو تركيب أدوية لهذه الروشتة حتى الآن.
                  </div>
                )}
              </div>

              {/* ملاحظات عامة وإرشادات لولي الأمر */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2 print:text-base print:font-bold">تعليمات وإرشادات الطبيب للمتابعة</label>
                <textarea 
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm print:border-none print:p-0 print:text-slate-700"
                  placeholder="تعليمات الراحة، نوع الطعام، أو موعد الاستشارة..."
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                />
              </div>

              {/* أزرار إنهاء الكشف الطبي (تختفي تماماً عند الطباعة) */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 print:hidden">
                <button 
                  onClick={() => setCurrentAppointment(null)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors"
                >
                  إلغاء
                </button>
                <button 
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors flex items-center gap-1"
                >
                  <Printer className="h-4 w-4" /> معاينة طباعة الروشتة
                </button>
                <button 
                  onClick={handleSaveAndComplete}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-100"
                >
                  <Save className="h-4 w-4" /> {isSaving ? 'جاري الحفظ المشفر...' : 'حفظ الكشف وإنهاء الزيارة'}
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center min-h-[420px] text-slate-400 gap-3">
              <div className="p-4 bg-blue-50 text-blue-500 rounded-full"><AlertCircle className="h-8 w-8" /></div>
              <div>
                <h3 className="font-bold text-slate-700 text-lg">لم يتم اختيار حالة طفل حالياً</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">يرجى الضغط على زر "بدء الفحص والروشتة" من طابور الانتظار الأيمن لعرض الملف وكتابة الجرعات.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
