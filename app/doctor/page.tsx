'use client'

import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import toast, { Toaster } from 'react-hot-toast'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import { 
  UserCheck, Users, CheckCircle, Clock, FileText, FileMedical, 
  Plus, Trash2, Save, AlertCircle, Printer, Send, History, 
  Weight, Thermometer, Edit, X, ChevronDown, ChevronUp
} from 'lucide-react'

// ============================================================
// 📋 الأنواع (Types)
// ============================================================
interface Patient {
  id: string
  name: string
  gender: string
  birth_date: string
  parent_phone: string
  parent_name: string
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
  dosage: string
  frequency: string
  duration: string
}

interface MedicalRecord {
  id: string
  diagnosis: string
  notes: string
  prescriptions: Medication[]
  created_at: string
}

// ============================================================
// 🏥 المكون الرئيسي
// ============================================================
export default function DoctorDashboard() {
  // الحالات الأساسية
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'waiting' | 'completed'>('waiting')
  const [showHistory, setShowHistory] = useState(false)
  
  // الحالات الخاصة بالكشف
  const [currentAppointment, setCurrentAppointment] = useState<Appointment | null>(null)
  const [diagnosis, setDiagnosis] = useState('')
  const [doctorNotes, setDoctorNotes] = useState('')
  const [medications, setMedications] = useState<Medication[]>([])
  const [newMed, setNewMed] = useState<Medication>({ name: '', dosage: '', frequency: '', duration: '' })
  const [customFields, setCustomFields] = useState<{ [key: string]: string }>({})
  const [isSaving, setIsSaving] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [patientHistory, setPatientHistory] = useState<MedicalRecord[]>([])
  const [showHistoryModal, setShowHistoryModal] = useState(false)
  
  // Refs للطباعة
  const prescriptionRef = useRef<HTMLDivElement>(null)

  // ============================================================
  // 📥 جلب البيانات
  // ============================================================
  const fetchTodayQueue = async () => {
    setLoading(true)
    const today = new Date().toISOString().split('T')[0]
    
    try {
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
            parent_phone,
            parent_name
          )
        `)
        .eq('visit_date', today)
        .order('queue_number', { ascending: true })

      if (error) throw error
      setAppointments(data as any || [])
    } catch (err) {
      console.error('Error fetching queue:', err)
      toast.error('حدث خطأ أثناء جلب قائمة الانتظار')
    } finally {
      setLoading(false)
    }
  }

  const fetchPatientHistory = async (patientId: string) => {
    try {
      const { data, error } = await supabase
        .from('clinic_medical_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setPatientHistory(data || [])
    } catch (err) {
      console.error('Error fetching history:', err)
      toast.error('حدث خطأ أثناء جلب التاريخ الطبي')
    }
  }

  useEffect(() => {
    fetchTodayQueue()
  }, [])

  // ============================================================
  // 🧮 دوال مساعدة
  // ============================================================
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
    return `${years} سنة و ${months} شهر و ${days} يوم`
  }

  // ============================================================
  // 👨‍⚕️ دوال الكشف
  // ============================================================
  const startConsultation = async (appointment: Appointment) => {
    setCurrentAppointment(appointment)
    setDiagnosis('')
    setDoctorNotes('')
    setMedications([])
    setCustomFields({})
    setShowHistoryModal(false)
    
    // جلب التاريخ الطبي للمريض
    await fetchPatientHistory(appointment.patient_id)
    
    // تحديث حالة الموعد
    await supabase
      .from('clinic_appointments')
      .update({ status: 'checking' })
      .eq('id', appointment.id)
    
    toast.success(`بدء الكشف على ${appointment.clinic_patients?.name}`)
  }

  const updateVitalSigns = async (field: 'weight' | 'temperature', value: number) => {
    if (!currentAppointment) return
    
    try {
      await supabase
        .from('clinic_appointments')
        .update({ [field]: value })
        .eq('id', currentAppointment.id)
      
      setCurrentAppointment({
        ...currentAppointment,
        [field]: value
      })
      
      toast.success(`تم تحديث ${field === 'weight' ? 'الوزن' : 'الحرارة'}`)
    } catch (err) {
      toast.error('حدث خطأ أثناء التحديث')
    }
  }

  // ============================================================
  // 💊 دوال الروشتة
  // ============================================================
  const addMedication = () => {
    if (!newMed.name || !newMed.dosage) {
      toast.error('يرجى إدخال اسم الدواء والجرعة على الأقل')
      return
    }
    setMedications([...medications, newMed])
    setNewMed({ name: '', dosage: '', frequency: '', duration: '' })
    toast.success('تم إضافة الدواء')
  }

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index))
  }

  // ============================================================
  // 💾 حفظ الكشف
  // ============================================================
  const saveConsultation = async () => {
    if (!currentAppointment) return
    if (!diagnosis.trim()) {
      toast.error('يرجى كتابة التشخيص الطبي أولاً')
      return
    }

    setIsSaving(true)
    try {
      // 1. حفظ السجل الطبي
      const { error: recordError } = await supabase
        .from('clinic_medical_records')
        .insert({
          patient_id: currentAppointment.patient_id,
          appointment_id: currentAppointment.id,
          diagnosis: diagnosis,
          notes: doctorNotes,
          prescriptions: medications,
          custom_fields: customFields,
          created_at: new Date().toISOString()
        })

      if (recordError) throw recordError

      // 2. تحديث حالة الموعد
      const { error: appError } = await supabase
        .from('clinic_appointments')
        .update({ status: 'completed' })
        .eq('id', currentAppointment.id)

      if (appError) throw appError

      toast.success('✅ تم حفظ الكشف والروشتة بنجاح!')
      setShowConfirmDialog(false)
      setCurrentAppointment(null)
      fetchTodayQueue()
    } catch (err) {
      console.error('Error saving consultation:', err)
      toast.error('حدث خطأ أثناء حفظ البيانات')
    } finally {
      setIsSaving(false)
    }
  }

  // ============================================================
  // 🖨️ دوال الطباعة والتصدير
  // ============================================================
  const printPrescription = () => {
    if (!prescriptionRef.current) return
    const printContent = prescriptionRef.current.innerHTML
    const originalContent = document.body.innerHTML
    
    document.body.innerHTML = `
      <div style="padding: 40px; font-family: Arial, sans-serif; direction: rtl;">
        ${printContent}
      </div>
    `
    window.print()
    document.body.innerHTML = originalContent
    window.location.reload()
  }

  const exportPDF = async () => {
    if (!prescriptionRef.current) return
    
    try {
      const canvas = await html2canvas(prescriptionRef.current, {
        scale: 2,
        useCORS: true
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 190
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      pdf.addImage(imgData, 'PNG', 10, 10, imgWidth, imgHeight)
      pdf.save(`روشتة-${currentAppointment?.clinic_patients?.name || 'مريض'}.pdf`)
      toast.success('تم تصدير الروشتة كـ PDF')
    } catch (err) {
      toast.error('حدث خطأ أثناء تصدير PDF')
    }
  }

  const sendWhatsApp = () => {
    if (!currentAppointment) return
    const patient = currentAppointment.clinic_patients
    const phone = patient?.parent_phone?.replace(/[^0-9]/g, '') || ''
    
    let message = `🏥 *عيادة PediaCare*\n\n`
    message += `👶 *المريض:* ${patient?.name}\n`
    message += `📋 *التشخيص:* ${diagnosis}\n\n`
    message += `💊 *الروشتة:*\n`
    medications.forEach((med, i) => {
      message += `${i+1}. ${med.name} - ${med.dosage}`
      if (med.frequency) message += ` (${med.frequency})`
      if (med.duration) message += ` لمدة ${med.duration}`
      message += '\n'
    })
    if (doctorNotes) message += `\n📝 *ملاحظات:* ${doctorNotes}`
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
    window.open(url, '_blank')
  }

  // ============================================================
  // 🎨 واجهة المستخدم
  // ============================================================
  const filteredAppointments = appointments.filter(app => {
    if (activeTab === 'waiting') return app.status === 'waiting' || app.status === 'checking'
    return app.status === 'completed'
  })

  return (
    <div className="p-6 bg-slate-50 min-h-screen text-right" dir="rtl">
      <Toaster position="top-center" />
      
      {/* ============================================ */}
      {/* 🏷️ الهيدر والإحصائيات */}
      {/* ============================================ */}
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

      {/* ============================================ */}
      {/* 📋 الشاشة الرئيسية */}
      {/* ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ========================================== */}
        {/* عمود قائمة الانتظار */}
        {/* ========================================== */}
        <div className="lg:col-span-1 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 h-fit">
          <div className="flex border-b border-slate-100 mb-4">
            <button 
              className={`flex-1 pb-3 font-semibold text-sm transition-all ${activeTab === 'waiting' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}
              onClick={() => setActiveTab('waiting')}
            >
              قائمة الانتظار
            </button>
            <button 
              className={`flex-1 pb-3 font-semibold text-sm transition-all ${activeTab === 'completed' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-slate-400'}`}
              onClick={() => setActiveTab('completed')}
            >
              المكتملة
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8 text-slate-400 animate-pulse">جاري التحميل...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <Users className="h-8 w-8 mx-auto text-slate-300 mb-2" />
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
                      #{app.queue_number}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${app.status === 'checking' ? 'bg-amber-100 text-amber-700 animate-pulse' : app.status === 'completed' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                      {app.status === 'checking' ? 'جاري الفحص' : app.status === 'completed' ? 'مكتمل' : 'ينتظر'}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-800 mt-2 text-base">{app.clinic_patients?.name || 'غير معروف'}</h3>
                  <div className="text-xs text-slate-500 space-y-1 mt-1.5">
                    <div>العمر: {app.clinic_patients?.birth_date ? calculateDetailedAge(app.clinic_patients.birth_date) : 'غير مسجل'}</div>
                    {(app.weight || app.temperature) && (
                      <div className="flex gap-3 text-slate-600 bg-white p-1.5 rounded border border-slate-100 mt-1 text-xs">
                        {app.weight && <span>⚖️ {app.weight} كجم</span>}
                        {app.temperature && <span>🌡️ {app.temperature}°م</span>}
                      </div>
                    )}
                  </div>
                  
                  {app.status !== 'completed' && currentAppointment?.id !== app.id && (
                    <button 
                      onClick={() => startConsultation(app)}
                      className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
                    >
                      <FileMedical className="h-3.5 w-3.5" /> بدء الكشف
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ========================================== */}
        {/* عمود شاشة الكشف */}
        {/* ========================================== */}
        <div className="lg:col-span-2">
          {currentAppointment ? (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
              
              {/* 👤 ترويسة المريض النشط */}
              <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase tracking-wide">الملف الطبي النشط</span>
                  <h2 className="text-2xl font-bold text-slate-800 mt-0.5">{currentAppointment.clinic_patients?.name}</h2>
                  <p className="text-xs text-slate-500 mt-1">
                    الجنس: {currentAppointment.clinic_patients?.gender === 'male' ? 'ذكر' : 'أنثى'} | 
                    العمر: {currentAppointment.clinic_patients?.birth_date && calculateDetailedAge(currentAppointment.clinic_patients.birth_date)}
                    {' | '}
                    <button 
                      onClick={() => { fetchPatientHistory(currentAppointment.patient_id); setShowHistoryModal(true); }}
                      className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 inline"
                    >
                      <History className="h-3 w-3" /> عرض التاريخ الطبي
                    </button>
                  </p>
                </div>
                <div className="text-right text-xs bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div>شكوى المساعد:</div>
                  <div className="font-medium text-slate-700 mt-0.5">{currentAppointment.notes || 'لا توجد ملاحظات'}</div>
                </div>
              </div>

              {/* 📊 تحديث العلامات الحيوية */}
              <div className="flex gap-4 flex-wrap bg-slate-50/50 p-3 rounded-lg border border-slate-200/60">
                <div className="flex items-center gap-2">
                  <Weight className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium">الوزن:</span>
                  <span className="text-sm">{currentAppointment.weight || '---'} كجم</span>
                  <button 
                    onClick={() => {
                      const val = prompt('أدخل الوزن الجديد (كجم):', currentAppointment.weight?.toString() || '')
                      if (val && !isNaN(parseFloat(val))) {
                        updateVitalSigns('weight', parseFloat(val))
                      }
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium">الحرارة:</span>
                  <span className="text-sm">{currentAppointment.temperature || '---'} °م</span>
                  <button 
                    onClick={() => {
                      const val = prompt('أدخل الحرارة الجديدة (°م):', currentAppointment.temperature?.toString() || '')
                      if (val && !isNaN(parseFloat(val))) {
                        updateVitalSigns('temperature', parseFloat(val))
                      }
                    }}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Edit className="h-3 w-3" />
                  </button>
                </div>
              </div>

              {/* 🩺 التشخيص */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  التشخيص الطبي <span className="text-red-500">*</span>
                </label>
                <textarea 
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="اكتب التشخيص الرئيسي هنا..."
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                />
              </div>

              {/* 💊 الروشتة */}
              <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-200/60 space-y-4" ref={prescriptionRef}>
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                    <FileText className="text-blue-600 h-4 w-4" /> الروشتة العلاجية
                  </h3>
                  <div className="flex gap-2">
                    {medications.length > 0 && (
                      <>
                        <button 
                          onClick={printPrescription}
                          className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-lg hover:bg-purple-200 transition flex items-center gap-1"
                        >
                          <Printer className="h-3 w-3" /> طباعة
                        </button>
                        <button 
                          onClick={exportPDF}
                          className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-200 transition flex items-center gap-1"
                        >
                          <FileText className="h-3 w-3" /> PDF
                        </button>
                        <button 
                          onClick={sendWhatsApp}
                          className="text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-200 transition flex items-center gap-1"
                        >
                          <Send className="h-3 w-3" /> واتساب
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* إضافة دواء جديد */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 bg-white p-3 rounded-lg border border-slate-100">
                  <input 
                    type="text" placeholder="اسم الدواء" 
                    className="p-2 border rounded-lg text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={newMed.name} onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="الجرعة (مثل: 5 مل)" 
                    className="p-2 border rounded-lg text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={newMed.dosage} onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                  />
                  <input 
                    type="text" placeholder="التكرار" 
                    className="p-2 border rounded-lg text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={newMed.frequency} onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                  />
                  <div className="flex gap-1">
                    <input 
                      type="text" placeholder="المدة" 
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

                {/* قائمة الأدوية */}
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

              {/* 📝 ملاحظات */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">تعليمات عامة أو ملاحظات</label>
                <textarea 
                  rows={2}
                  className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="تعليمات الراحة، موعد المتابعة، تحاليل مطلوبة..."
                  value={doctorNotes}
                  onChange={(e) => setDoctorNotes(e.target.value)}
                />
              </div>

              {/* 🎯 أزرار التحكم */}
              <div className="flex flex-wrap justify-end gap-3 pt-2 border-t border-slate-100">
                <button 
                  onClick={() => setCurrentAppointment(null)}
                  className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors"
                >
                  إلغاء المعاينة
                </button>
                <button 
                  onClick={() => setShowConfirmDialog(true)}
                  disabled={isSaving || !diagnosis.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-1.5 shadow-sm shadow-emerald-100"
                >
                  <Save className="h-4 w-4" /> {isSaving ? 'جاري الحفظ...' : 'حفظ وإنهاء الزيارة'}
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-3">
              <div className="p-4 bg-blue-50 text-blue-500 rounded-full"><AlertCircle className="h-8 w-8" /></div>
              <div>
                <h3 className="font-bold text-slate-700 text-lg">لم يتم اختيار مريض</h3>
                <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">اضغط على "بدء الكشف" من قائمة الانتظار اليمنى.</p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ============================================ */}
      {/* 🗂️ Modal عرض التاريخ الطبي */}
      {/* ============================================ */}
      {showHistoryModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">📋 التاريخ الطبي للمريض</h3>
              <button onClick={() => setShowHistoryModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>
            {patientHistory.length === 0 ? (
              <p className="text-center text-gray-400 py-8">لا يوجد سجلات طبية سابقة</p>
            ) : (
              <div className="space-y-4">
                {patientHistory.map((record) => (
                  <div key={record.id} className="border border-slate-100 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-semibold text-blue-600">
                        {new Date(record.created_at).toLocaleDateString('ar-EG')}
                      </span>
                      <span className="text-xs bg-slate-100 px-2 py-1 rounded">تشخيص</span>
                    </div>
                    <p className="font-medium mt-1">{record.diagnosis}</p>
                    {record.prescriptions && record.prescriptions.length > 0 && (
                      <div className="mt-2 text-sm text-slate-600">
                        <span className="font-medium">الروشتة:</span>
                        <ul className="list-disc pr-5 mt-1">
                          {record.prescriptions.map((med, i) => (
                            <li key={i}>{med.name} - {med.dosage}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {record.notes && (
                      <p className="text-sm text-slate-500 mt-1">📝 {record.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* ⚠️ Modal تأكيد الحفظ */}
      {/* ============================================ */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-center mb-4">⚠️ تأكيد إنهاء الزيارة</h3>
            <p className="text-center text-slate-600 mb-6">
              هل أنت متأكد من حفظ الكشف والروشتة وإنهاء زيارة 
              <span className="font-bold text-slate-800"> {currentAppointment?.clinic_patients?.name}</span>؟
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowConfirmDialog(false)}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition"
              >
                إلغاء
              </button>
              <button 
                onClick={saveConsultation}
                disabled={isSaving}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {isSaving ? 'جاري الحفظ...' : 'تأكيد الحفظ'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
