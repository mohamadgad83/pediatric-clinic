'use client'

import { useState, useEffect } from 'react'
import { 
  Users, Plus, Trash2, Clock, CheckCircle, 
  Printer, Save, UserCheck, FileText, Sparkles,
  User, Activity, Stethoscope, Clipboard, HeartPulse, Search, Scale
} from 'lucide-react'

// 💊 قاعدة بيانات الأدوية الذكية بتركيزاتها ومعادلات الجرعات للأطفال
const DRUGS_DATABASE = [
  { id: '1', name: 'Paracetamol (Cetal) Syrup', concentration: '250mg/5ml', baseDosePerKg: 15, timesPerDay: 3, type: 'Antipyretic' },
  { id: '2', name: 'Paracetamol (Paramol) Drops', concentration: '100mg/1ml', baseDosePerKg: 15, timesPerDay: 4, type: 'Antipyretic' },
  { id: '3', name: 'Amoxicillin (E-Mox) 250mg Susp', concentration: '250mg/5ml', baseDosePerKg: 40, timesPerDay: 3, type: 'Antibiotic' },
  { id: '4', name: 'Augmentin 457mg Susp', concentration: '457mg/5ml', baseDosePerKg: 45, timesPerDay: 2, type: 'Antibiotic' },
  { id: '5', name: 'Brufen Syrup', concentration: '100mg/5ml', baseDosePerKg: 10, timesPerDay: 3, type: 'Analgesic' },
  { id: '6', name: 'Motilium Syrup', concentration: '5mg/5ml', baseDosePerKg: 0.25, timesPerDay: 3, type: 'Anti-emetic' },
]

// 📋 اختصارات التشخيص السريع
const QUICK_DIAGNOSIS = [
  { title: 'التهاب حاد باللوزتين', eng: 'Acute Tonsillitis', defaultRx: '1- Augmentin 457mg Susp\n2- Paracetamol (Cetal) Syrup' },
  { title: 'نزلة معوية حادة', eng: 'Acute Gastroenteritis', defaultRx: '1- Motilium Syrup\n2- Smecta Sachets\n3- ORS Hydration' },
  { title: 'التهاب الشعب الهوائية', eng: 'Acute Bronchiolitis', defaultRx: '1- Ventolin Syrup\n2- Brufen Syrup' },
]

const initialQueue = [
  { id: 1, name: "يوسف أحمد محمود", age: "سنتان", weight: 12, type: "كشف جديد", time: "10:30 ص" },
  { id: 2, name: "فاطمة عمر إبراهيم", age: "5 سنوات", weight: 18, type: "إعادة واستشارة", time: "10:45 ص" },
  { id: 3, name: "آدم مصطفى كريم", age: "8 أشهر", weight: 8, type: "كشف جديد", time: "11:00 ص" },
]

export default function DoctorDashboard() {
  const [activeTab, setActiveTab] = useState<'queue' | 'patients' | 'billing'>('queue')
  const [queue, setQueue] = useState(initialQueue)
  const [currentPatient, setCurrentPatient] = useState<typeof initialQueue[0] | null>(null)
  
  // حالات استمارة الكشف
  const [complaint, setComplaint] = useState('')
  const [examination, setExamination] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  const [prescription, setPrescription] = useState('')
  const [patientWeight, setPatientWeight] = useState<number>(0)

  // حالات البحث التلقائي عن الأدوية
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredDrugs, setFilteredDrugs] = useState<typeof DRUGS_DATABASE>([])

  // مراقبة البحث عن الدواء بمجرد كتابة حروف
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const filtered = DRUGS_DATABASE.filter(drug => 
        drug.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredDrugs(filtered)
    } else {
      setFilteredDrugs([])
    }
  }, [searchQuery])

  const handleStartExamination = (patient: typeof initialQueue[0]) => {
    setCurrentPatient(patient)
    setPatientWeight(patient.weight)
    setComplaint('')
    setExamination('')
    setDiagnosis('')
    setPrescription('')
    setSearchQuery('')
  }

  // دالة اختيار الدواء وحساب جرعته فوراً بالمعادلة الطبية لوزن الطفل
  const handleSelectDrug = (drug: typeof DRUGS_DATABASE[0]) => {
    if (!patientWeight || patientWeight <= 0) {
      alert('يرجى تحديد وزن الطفل أولاً لحساب الجرعة بدقة!')
      return
    }

    // استخراج القيم العددية من التركيز (مثل "250mg/5ml" -> قوة 250، حجم 5)
    const match = drug.concentration.match(/(\d+)mg\/(\d+)ml/)
    let calculatedVolume = 0
    
    if (match) {
      const mg = parseInt(match[1])
      const ml = parseInt(match[2])
      
      // معادلة حساب جرعة الشراب الطبية للأطفال لكل جرعة منفردة
      const totalMgPerDay = patientWeight * drug.baseDosePerKg
      const singleMgPerDose = totalMgPerDay / drug.timesPerDay
      calculatedVolume = (singleMgPerDose * ml) / mg
    } else {
      // حساب افتراضي للنقاط (Drops)
      calculatedVolume = patientWeight * 0.5
    }

    const finalDose = calculatedVolume.toFixed(1)
    const drugLine = `• ${drug.name} (${drug.concentration})\n  Dosage: ${finalDose} ml (or drops) ${drug.timesPerDay} times daily.\n`
    
    setPrescription(prev => prev + drugLine)
    setSearchQuery('')
    setFilteredDrugs([])
  }

  const handleQuickPreset = (preset: typeof QUICK_DIAGNOSIS[0]) => {
    setDiagnosis(preset.eng)
    setPrescription(prev => prev + `\n--- Suggested for ${preset.eng} ---\n` + preset.defaultRx + `\n`)
  }

  const handleSaveMedicalRecord = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPatient) return
    alert(`تم حفظ الروشتة بنجاح للطفل: ${currentPatient.name}\nوجاهزة الآن للطباعة العيادية!`)
    setQueue(queue.filter(p => p.id !== currentPatient.id))
    setCurrentPatient(null)
  }

  return (
    <div className="min-h-screen bg-slate-50 text-right p-4 md:p-6" style={{ direction: 'rtl' }}>
      
      {/* الهيدر */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">غرفة فحص د. محمد جاد</h1>
            <p className="text-slate-400 text-xs">منظومة الروشتة الذكية وحساب جرعات الأطفال التلقائي حسب الوزن</p>
          </div>
        </div>
      </header>

      {/* الإحصائيات */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div><p className="text-slate-400 text-xs font-bold">انتظار العيادة اليوم</p><h3 className="text-xl font-black text-amber-600 mt-1">{queue.length} أطفال</h3></div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl"><Clock className="h-5 w-5" /></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-bold">وزن الحالة النشطة</p>
            <h3 className="text-xl font-black text-blue-600 mt-1">{patientWeight > 0 ? `${patientWeight} كجم` : 'لم يحدد'}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Scale className="h-5 w-5" /></div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
          <div><p className="text-slate-400 text-xs font-bold">حالات منتهية</p><h3 className="text-xl font-black text-emerald-600 mt-1">5 حالات</h3></div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><CheckCircle className="h-5 w-5" /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white p-4 md:p-6 rounded-2xl border shadow-sm">
        
        {/* اليمين: قائمة الحالات */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="font-bold text-slate-700 pb-2 border-b flex items-center gap-2 text-sm text-blue-600">
            <UserCheck className="h-5 w-5" /> قائمة الأطفال بالخارج
          </h3>
          <div className="space-y-3">
            {queue.map((patient) => (
              <div key={patient.id} className={`p-4 rounded-xl border transition-all ${currentPatient?.id === patient.id ? 'border-blue-500 bg-blue-50/30 ring-1 ring-blue-500' : 'border-slate-100 bg-slate-50'}`}>
                <h4 className="font-bold text-slate-800 text-sm">{patient.name}</h4>
                <p className="text-slate-400 text-xs mt-1">السن: {patient.age} | الوزن القياسي: {patient.weight} كجم</p>
                <button type="button" onClick={() => handleStartExamination(patient)} className="w-full mt-3 bg-white hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 py-1.5 rounded-lg text-xs font-bold transition-all">
                  بدء فحص الطفل وحساب الجرعة
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* اليسار: استمارة الكشف والمحرك الذكي */}
        <div className="lg:col-span-2 border-r pr-0 lg:pr-6 border-slate-100">
          <h3 className="font-bold text-slate-700 pb-2 border-b flex items-center gap-2 text-sm text-emerald-600">
            <HeartPulse className="h-5 w-5" /> بورد الفحص والتشخيص الرقمي الفوري
          </h3>

          {currentPatient ? (
            <form onSubmit={handleSaveMedicalRecord} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border text-xs font-bold">
                <div className="text-slate-700">الطفل الحالي: <span className="text-blue-600">{currentPatient.name}</span></div>
                <div className="flex items-center gap-2 justify-end text-slate-700">
                  <span>الوزن الحالي (كجم):</span>
                  <input type="number" className="w-16 p-1 border rounded text-center bg-white" value={patientWeight} onChange={(e) => setPatientWeight(parseFloat(e.target.value) || 0)} />
                </div>
              </div>

              {/* أزرار التشخيص السريع */}
              <div>
                <span className="block text-xs font-bold text-slate-500 mb-1.5">💡 تشخيصات شائعة ونماذج جاهزة:</span>
                <div className="flex flex-wrap gap-2">
                  {QUICK_DIAGNOSIS.map((preset, i) => (
                    <button key={i} type="button" onClick={() => handleQuickPreset(preset)} className="bg-slate-100 hover:bg-blue-50 border hover:border-blue-300 px-2.5 py-1 rounded-lg text-xs text-slate-700 font-medium transition-all">
                      + {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">الشكوى والأعراض (Complaint)</label>
                  <textarea rows={2} className="w-full p-3 rounded-xl border text-xs text-left" style={{ direction: 'ltr' }} value={complaint} onChange={(e) => setComplaint(e.target.value)} placeholder="e.g. Cough, Fever..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">التشخيص الطبي (Diagnosis)</label>
                  <textarea rows={2} required className="w-full p-3 rounded-xl border text-xs text-left font-bold" style={{ direction: 'ltr' }} value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Acute Tonsillitis" />
                </div>
              </div>

              {/* 🔍 خانة البحث التلقائي السحرية عن الأصناف */}
              <div className="relative bg-blue-50/40 p-3 rounded-xl border border-blue-100">
                <label className="block text-xs font-bold text-blue-700 mb-1.5 flex items-center gap-1">
                  <Search className="h-3.5 w-3.5" /> البحث التلقائي عن الصنف الدوائي وحساب جرعته فوراً:
                </label>
                <input 
                  type="text" 
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" 
                  placeholder="اكتب أول حرفين من الدواء (مثال: Paracetamol أو Augmentin)..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />

                {/* قائمة الاقتراحات المنسدلة عند البحث */}
                {filteredDrugs.length > 0 && (
                  <div className="absolute right-3 left-3 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto z-50 divide-y">
                    {filteredDrugs.map((drug) => (
                      <button
                        key={drug.id} type="button" onClick={() => handleSelectDrug(drug)}
                        className="w-full text-right p-2.5 hover:bg-blue-50 text-xs transition-colors flex justify-between items-center"
                      >
                        <span className="font-bold text-slate-800">{drug.name}</span>
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px]">{drug.concentration} ({drug.type})</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* الروشتة النهائية */}
              <div>
                <label className="block text-xs font-bold text-emerald-700 mb-1.5 flex items-center gap-1">
                  <Printer className="h-3.5 w-3.5" /> الروشتة المطبوعة الناتجة (Prescription)
                </label>
                <textarea 
                  rows={5} required
                  className="w-full p-3 rounded-xl border border-emerald-200 text-xs text-left font-mono bg-emerald-50/10" style={{ direction: 'ltr' }}
                  value={prescription} onChange={(e) => setPrescription(e.target.value)}
                  placeholder="التركيب الدوائي والجرعات المحسوبة ستظهر هنا تلقائياً ويمكنك التعديل عليها..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setCurrentPatient(null)} className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50">إلغاء</button>
                <button type="submit" className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-1.5">
                  <Save className="h-4 w-4" /> حفظ طباعة الروشتة الشاملة
                </button>
              </div>
            </form>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-slate-300">
              <Stethoscope className="h-14 w-14 mb-2 stroke-1" />
              <p className="text-xs font-bold">يرجى اختيار طفل من القائمة اليمنى للبدء في تشغبل محرك الروشتات وحساب الجرعات</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
