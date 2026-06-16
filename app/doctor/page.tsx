'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase' // تأكد من مسار السيرفر أو الكلاينت المناسب لديك
import { 
  UserCheck, 
  Users, 
  CheckCircle, 
  Clock, 
  FileText, 
  FileMedical, 
  Plus, 
  Trash2, 
  Save, 
  AlertCircle 
} from 'lucide-react'

// تعريف الأنواع (Interfaces) بناءً على جداول قاعدة البيانات الخاصة بك
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
  dosage: string    // مثل: 5 مل
  frequency: string // مثل: 3 مرات يومياً
  duration: string  // مثل: 5 أيام
}

export default function DoctorDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'waiting' | 'completed'>('waiting')
  
  // الحالات الخاصة بمعاينة المريض الحالي (Active Consultation)
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null)
  const [diagnosis, setDiagnosis] = useState('')
  const [doctorNotes, setDoctorNotes] = useState('')
  const [medications, setMedications] = useState<Medication[]>([])
  const [newMed, setNewMed] = useState<Medication>({ name: '', dosage: '', frequency: '', duration: '' })
  const [customFields, setCustomFields] = useState<{ [key: string]: string }>({})
  const [isSaving, setIsSaving] = useState(false)

  // جلب الطابور اليومي
  const fetchTodayQueue = async () => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    
    try {
      // إصلاح الربط هنا باستخدام اسم الجدول الصحيح لديك: clinic_patients
      const { data, error } = await supabase
        .from('clinic_appointments')
        .select(`
          id,
          patient_id,
          visit_date,
          status,
          queue_number,
          notes,
          weight,
          height,
          temperature,
          clinic_patients (
            id,
            name,
            gender,
            birth_date,
            parent_phone
          )
        `)
        .eq('visit_date', today)
        .order('queue_number', { ascending: true })

      if (error) throw error
      setAppointments(data as any || [])
    } catch (err) {
      console.error('Error fetching queue:', err)
      alert('حدث خطأ أثناء جلب قائمة الانتظار')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodayQueue()
  }, [])

  // دالة مطورة لحساب عمر الطفل بالسنوات والشهور والأيام بدقة طبية
  const calculateDetailedAge = (birthDateString: string) => {
    if (!birthDateString) return ''
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

    if (years === 0 && months === 0) return `${days} يوم`
    if (years === 0) return `${months} شهر و ${days} يوم`
    return `${years} سنة و ${months} شهر`
  }

  // فلترة المواعيد حسب التبويب النشط
  const filteredAppointments = appointments.filter(app => {
    if (activeTab === 'waiting') return app.status === 'waiting' || app.status === 'checking'
    return app.status === 'completed'
  })

  // بدء الكشف على مريض
  const startConsultation = async (appointment: Appointment) => {
    setCurrentAppointment(appointment)
    setDiagnosis('')
    setDoctorNotes('')
    setMedications([])
    setCustomFields({})
    
    // تحديث حالة الموعد في السيرفر إلى "جاري الكشف"
    await supabase
      .from('clinic_appointments')
      .update({ status: 'checking' })
      .eq('id', appointment.id)
  }

  // إضافة دواء للروشتة الحالية
  const addMedication = () => {
    if (!newMed.name || !newMed.dosage) {
      alert('يرجى إدخال اسم الدواء والجرعة على الأقل')
      return
    }
    setMedications([...medications, newMed])
    setNewMed({ name: '', dosage: '', frequency: '', duration: '' })
  }

  // حذف دواء من الروشتة
  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  // حفظ الكشف الطبي والروشتة وإنهاء الزيارة
  const saveConsultation = async () => {
    if (!currentAppointment) return
    if (!diagnosis.trim()) {
      alert('يرجى كتابة التشخيص الطبي أولاً')
      return
    }

    setIsSaving(true)
    try {
      // 1. إدخال السجل الطبي المريض في جدول الحالات (clinic_medical_records)
      const { error: recordError } = await supabase
        .from('clinic_medical_records')
        .insert({
          patient_id: currentAppointment.patient_id,
          appointment_id: currentAppointment.id,
          diagnosis: diagnosis,
          notes: doctorNotes,
          prescriptions: medications, // تخزين مصفوفة الأدوية المهيكلة كـ JSON
          custom_fields: customFields,
          created_at: new Date().toISOString()
        })

      if (recordError) throw recordError

      // 2. تحديث حالة الموعد في جدول المواعيد إلى مكتمل
      const { error: appError } = await supabase
        .from('clinic_appointments')
        .update({ status: 'completed' })
        .eq('id', currentAppointment.id)

      if (appError) throw appError

      alert('تم حفظ الكشف والروشتة بنجاح!')
      setCurrentAppointment(null) // إغلاق شاشة الكشف
      fetchTodayQueue() // تحديث الطابور
    } catch (err) {
      console.error('Error saving consultation:', err)
      alert('حدث خطأ أثناء حفظ البيانات، يرجى المحاولة مرة أخرى')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-right" dir="rtl">
      {/* العناوين الرئيسية والعدادات */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <UserCheck className="text-blue-600 h-8 w-8" /> لوحة تحكم الطبيب
          </h1>
          <p className="text-slate-500 mt-1">متابعة حالات الأطفال اليومية، الفحص وكتابة الروشتات الطبية الإلكترونية.</p>
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

      {/* تقسيم الشاشة: اليمين طابور الانتظار، اليسار شاشة الفحص النشطة */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* عمود طابور الحالات اليومية */}
        <div className="lg:col-span-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <div className="flex border-b border-slate-100 mb-4">
            <button 
              className={`flex-1 pb-3 font-semibold text-sm transition-all ${activeTab === 'waiting' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}
              onClick={() => setActiveTab('waiting')}
            >
              قائمة الانتظار الحالية
            </button>
            <button 
              className={`flex-1 pb-3 font-semibold text-sm transition-all ${activeTab === 'completed' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}
              onClick={() => setActiveTab('completed')}
            >
              الحالات المنتهية
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-400 animate-pulse">جاري تحميل الحالات...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-slate-400 flex flex-col items-center justify-center gap-2">
              <Users className="h-8 w-8 text-slate-300" />
              <span>لا توجد حالات في هذه القائمة اليوم.</span>
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
                  <h3 className="font-bold text-slate-800 mt-2 text-base">{app.clinic_patients?.name || 'مريض غير معروف'}</h3>
                  <div className="text-xs text-slate-500 space-y-1 mt-1.5">
                    <div>العمر: {app.clinic_patients?.birth_date ? calculateDetailedAge(app.clinic_patients.birth_date) : 'غير مسجل'}</div>
                    {(app.weight || app.temperature) && (
                      <div className="flex gap-2 text-slate-600 bg-white p-1.5 rounded border border-slate-100 mt-1">
                        {app.weight && <span>الوزن: <b>{app.weight} كجم</b></span>}
                        {app.temperature && <span>الحرارة: <b>{app.temperature} °م</b></span>}
                      </div>
                    )}
                  </div>
                  
                  {app.status !== 'completed' && currentAppointment?.id !== app.id && (
                    <button 
                      onClick={() => startConsultation(app)}
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <FileMedical className="h-3.5 w-3.5" /> بدء الكشف الطبي
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* عمود نموذج المعاينة والفحص الفعلي للمريض الحالي */}
        <div className="lg:col-span-2">
          {currentAppointment ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
              
              {/* ترويسة ملف المريض النشط */}
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">الملف الطبي النشط</span>
                  <h2 className="text-2xl font-bold text-slate-800 mt-0.5">{currentAppointment.clinic_patients?.name}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    الجنس: {currentAppointment.clinic_patients?.gender === 'male' ? 'ذكر' : 'أنثى'} | 
                    العمر الحالي: {currentAppointment.clinic_patients?.birth_date && calculateDetailedAge(currentAppointment.clinic_patients.birth_date)}
                  </p>
                </div>
                <div className="text-right text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div>شكوى المساعد الزائر:</div>
                  <div className="font-medium text-slate-700 mt-0.5">{currentAppointment.notes || 'لا توجد ملاحظات أولية'}</div>
                </div>
              </div>

              {/* 1. حقل التشخيص */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">التشخيص الطبي (Diagnosis) *</label>
                <textarea 
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="اكتب التشخيص الرئيسي للطفل هنا (مثال: التهاب حاد في اللوزتين...)"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              {/* 2. بناء الروشتة الإلكترونية الطبية */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 space-y-4">
                <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                  <FileText className="text-blue-600 h-4 w-4" /> تركيب الروشتة العلاجية (Prescription)
                </h3>
                
                {/* مدخلات الدواء الجديد */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white p-3 rounded-lg border border-slate-100">
                  <input 
                    type="text" placeholder="اسم الدواء (مثل: Paracetamol)" 
                    className="p-2 border rounded-lg text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={newMed.name} onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="الجرعة (مثل: 5 مل أو ملعقة)" 
                    className="p-2 border rounded-lg text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={newMed.dosage} onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="التكرار (مثل: 3 مرات يومياً)" 
                    className="p-2 border rounded-lg text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={newMed.frequency} onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                  />
                  <div className="flex gap-1">
                    <input 
                      type="text" placeholder="المدة (5 أيام)" 
                      className="p-2 border rounded-lg text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                      value={newMed.duration} onChange={(e) => setNewMed({...newMed, duration: e.target.value})}
                    />
                    <button 
                      type="button" onClick={addMedication}
                      className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors flex items-center justify-center shrink-0"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* جدول أو قائمة الأدوية المضافة حالياً */}
                {medications.length > 0 ? (
                  <div className="bg-white rounded-lg border border-slate-100 overflow-hidden text-xs">
                    <table className="w-full text-right border-collapse">
                      <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                          <th className="p-2">الدواء</th>
                          <th className="p-2">الجرعة</th>
                          <th className="p-2">التكرار</th>
                          <th className="p-2">المدة</th>
                          <th className="p-2 text-center w-12">حذف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {medications.map((med, index) => (
                          <tr key={index} className="hover:bg-slate-50/80">
                            <td className="p-2 font-semibold text-slate-800">{med.name}</td>
                            <td className="p-2">{med.dosage}</td>
                            <td className="p-2">{med.frequency}</td>
                            <td className="p-2">{med.duration}</td>
                            <td className="p-2 text-center">
                              <button type="button" onClick={() => removeMedication(index)} className="text-rose-500 hover:text-rose-700">
                                <Trash2 className="h-3.5 w-3.5 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg bg-white">
                    لم يتم إضافة أي أدوية للروشتة بعد.
                  </div>
                )}
              </div>

              {/* 3. ملاحظات وتوصيات عامة لولي الأمر */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">تعليمات عامة أو ملاحظات سرية</label>
                <textarea 
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="تعليمات الراحة، الإعادة بعد كم يوم، أو ملاحظات التحاليل المطلوبة..."
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                />
              </div>

              {/* أزرار الحفظ والإلغاء */}
              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button 
                  onClick={() => setCurrentAppointment(null)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors"
                >
                  إلغاء المعاينة
                </button>
                <button 
                  onClick={saveConsultation}
                  disabled={isSaving}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-100"
                >
                  <Save className="h-4 w-4" /> {isSaving ? 'جاري الحفظ والإنهاء...' : 'حفظ وإنهاء الزيارة'}
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-3">
              <div className="p-4 bg-blue-50 text-blue-500 rounded-full"><AlertCircle className="h-8 w-8" /></div>
              <div>
                <h3 className="font-bold text-slate-700 text-lg">لم يتم اختيار حالة مريض حالياً</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">اضغط على زر "بدء الكشف الطبي" من طابور الانتظار الأيمن للبدء في تشخيص الطفل وصرف الروشتة.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
