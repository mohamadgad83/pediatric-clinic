'use client'

import { useState, useEffect, useRef } from 'react'
import { 
  Users, Plus, Trash2, Clock, CheckCircle, 
  Printer, Save, UserCheck, FileText, Sparkles,
  User, Activity, Stethoscope, Clipboard, HeartPulse, Search, Scale, Thermometer, ShieldAlert, ChevronLeft
} from 'lucide-react'

// 💊 قاعدة بيانات الأدوية الشاملة لعيادات الأطفال (الاسم، التركيز، الجرعة لكل كجم)
const DRUGS_DATABASE = [
  { id: '1', name: 'Paracetamol (Cetal) Syrup', concentration: '250mg/5ml', baseDosePerKg: 15, timesPerDay: 3, instruction: 'عند اللزوم أو كل 8 ساعات' },
  { id: '2', name: 'Paracetamol (Paramol) Drops', concentration: '100mg/1ml', baseDosePerKg: 15, timesPerDay: 4, instruction: 'نقاط بالفم عند السخونية' },
  { id: '3', name: 'Amoxicillin (E-Mox) 250mg Susp', concentration: '250mg/5ml', baseDosePerKg: 40, timesPerDay: 3, instruction: 'بعد الأكل بانتظام لمدة 7 أيام' },
  { id: '4', name: 'Augmentin 457mg Susp', concentration: '457mg/5ml', baseDosePerKg: 45, timesPerDay: 2, instruction: 'كل 12 ساعة بانتظام لمدة أسبوع' },
  { id: '5', name: 'Brufen Syrup', concentration: '100mg/5ml', baseDosePerKg: 10, timesPerDay: 3, instruction: 'بعد الأكل كمضاد للالتهاب وخافض حرارة' },
  { id: '6', name: 'Motilium Syrup', concentration: '5mg/5ml', baseDosePerKg: 0.25, timesPerDay: 3, instruction: 'قبل الرضاعة أو الأكل بـ 15 دقيقة' },
  { id: '7', name: 'Zithromax 200mg/5ml Susp', concentration: '200mg/5ml', baseDosePerKg: 10, timesPerDay: 1, instruction: 'مرة واحدة يومياً قبل الأكل بساعة لمدة 3 أيام' },
]

interface SelectedDrug {
  uniqueId: string;
  name: string;
  concentration: string;
  calculatedDose: string;
  timesPerDay: number;
  instruction: string;
}

const initialQueue = [
  { id: 1, name: "يوسف أحمد محمود", age: "سنتان", weight: 12, temp: "38.5", type: "كشف جديد", time: "10:30 ص" },
  { id: 2, name: "فاطمة عمر إبراهيم", age: "5 سنوات", weight: 18, temp: "37.0", type: "إعادة واستشارة", time: "10:45 ص" },
  { id: 3, name: "آدم مصطفى كريم", age: "8 أشهر", weight: 8, temp: "39.1", type: "كشف جديد", time: "11:00 ص" },
]

export default function DoctorDashboard() {
  const [queue, setQueue] = useState(initialQueue)
  const [currentPatient, setCurrentPatient] = useState<typeof initialQueue[0] | null>(null)
  
  // علامات حيوية متغيرة
  const [patientWeight, setPatientWeight] = useState<number>(0)
  const [patientTemp, setPatientTemp] = useState<string>('37.0')
  const [complaint, setComplaint] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  
  // محرك الأدوية الذكي
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredDrugs, setFilteredDrugs] = useState<typeof DRUGS_DATABASE>([])
  const [selectedDrugsList, setSelectedDrugsList] = useState<SelectedDrug[]>([])
  const [customInstruction, setCustomInstruction] = useState('')
  const [selectedDrugIndex, setSelectedDrugIndex] = useState<number>(-1)

  // مراقبة البحث الفوري أثناء الكتابة
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
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
    setPatientTemp(patient.temp)
    setComplaint('')
    setDiagnosis('')
    setSelectedDrugsList([])
    setSearchQuery('')
  }

  // حساب وإضافة الدواء للروشتة الحالية
  const handleAddDrug = (drug: typeof DRUGS_DATABASE[0]) => {
    if (!patientWeight || patientWeight <= 0) {
      alert('يرجى التأكد من إدخال وزن الطفل أولاً لحساب الجرعة بدقة!');
      return;
    }

    const match = drug.concentration.match(/(\d+)mg\/(\d+)ml/)
    let doseVolume = ""
    
    if (match) {
      const mg = parseInt(match[1])
      const ml = parseInt(match[2])
      const totalMgPerDay = patientWeight * drug.baseDosePerKg
      const singleDoseMg = totalMgPerDay / drug.timesPerDay
      doseVolume = ((singleDoseMg * ml) / mg).toFixed(1) + " مل"
    } else {
      doseVolume = (patientWeight * 0.5).toFixed(0) + " نقطة"
    }

    const newDrugItem: SelectedDrug = {
      uniqueId: Math.random().toString(),
      name: drug.name,
      concentration: drug.concentration,
      calculatedDose: doseVolume,
      timesPerDay: drug.timesPerDay,
      instruction: drug.instruction
    }

    setSelectedDrugsList([...selectedDrugsList, newDrugItem])
    setSearchQuery('')
    setFilteredDrugs([])
  }

  const handleRemoveDrug = (uniqueId: string) => {
    setSelectedDrugsList(selectedDrugsList.filter(d => d.uniqueId !== uniqueId))
  }

  const handleSaveAndPrint = (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentPatient) return
    if (selectedDrugsList.length === 0) {
      alert('لا يمكن حفظ روشتة فارغة، أضف دواءً واحداً على الأقل.')
      return
    }
    alert(`🖨️ تم إرسال الروشتة لملف الطفل: ${currentPatient.name}\nعدد الأدوية المسجلة: ${selectedDrugsList.length}`)
    setQueue(queue.filter(p => p.id !== currentPatient.id))
    setCurrentPatient(null)
  }

  return (
    <div className="min-h-screen bg-slate-100 text-right font-sans antialiased" style={{ direction: 'rtl' }}>
      
      {/* البار العلوي الاحترافي */}
      <div className="bg-slate-900 text-white shadow-xl px-6 py-4 flex justify-between items-center border-b border-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl animate-pulse">
            <HeartPulse className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide">E-Rx Smart v2.5</span>
            <h1 className="text-lg font-black tracking-tight mt-0.5">منصة عيادة الأطفال الذكية (PediaCare)</h1>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">التاريخ: {new Date().toLocaleDateString('ar-EG')}</div>
          <span className="text-blue-400">د. محمد جاد</span>
        </div>
      </div>

      <div className="p-4 md:p-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* العمود الجانبي: إدارة العيادة وقائمة الانتظار */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
            <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-600" /> الحالات المنتظرة بالخارج ({queue.length})
            </h3>
            
            <div className="mt-3 space-y-2.5">
              {queue.map((patient) => (
                <div 
                  key={patient.id} 
                  onClick={() => handleStartExamination(patient)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${currentPatient?.id === patient.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 hover:bg-slate-100 border-slate-200'}`}
                >
                  <div>
                    <h4 className="font-bold text-sm tracking-tight">{patient.name}</h4>
                    <p className={`text-xs mt-1 ${currentPatient?.id === patient.id ? 'text-blue-100' : 'text-slate-400'}`}>السن: {patient.age} | الوزن: {patient.weight} كجم</p>
                  </div>
                  <span className={`px-2 py-1 rounded-md text-[10px] font-black ${parseFloat(patient.temp) >= 38.5 ? 'bg-rose-100 text-rose-700 animate-bounce' : 'bg-white text-slate-500 border'}`}>{patient.temp}°م</span>
                </div>
              ))}
            </div>
          </div>

          {/* وحدة التحذيرات السريعة للتطعيمات والمتابعة */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs space-y-2">
            <h4 className="font-black text-amber-800 flex items-center gap-1"><ShieldAlert className="h-4 w-4" /> بروتوكول أمان جرعات الأطفال:</h4>
            <p className="text-amber-700 leading-relaxed">البرنامج يحسب الجرعات تلقائياً بالاعتماد على الوزن الفعلي المدخل. يرجى مراجعة الوزن قبل الضغط على زر اعتماد وطباعة الروشتة الطبية الرسمية.</p>
          </div>
        </div>

        {/* بورد الفحص وباني الروشتات الإلكتروني */}
        <div className="lg:col-span-3 space-y-6">
          {currentPatient ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-6 space-y-6">
              
              {/* شريط بيانات المريض والملف الطبي الفوري */}
              <div className="bg-slate-50 border p-4 rounded-xl grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-slate-700">
                <div className="flex items-center gap-2"><User className="h-4 w-4 text-slate-400" /> المريض: <span className="text-blue-600 text-sm font-black">{currentPatient.name}</span></div>
                <div className="flex items-center gap-2">السن: <span className="text-slate-900">{currentPatient.age}</span></div>
                <div className="flex items-center gap-2">
                  <Scale className="h-4 w-4 text-slate-400" /> الوزن (كجم): 
                  <input type="number" className="w-16 border rounded text-center bg-white p-0.5 text-blue-600 font-black" value={patientWeight} onChange={(e) => setPatientWeight(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4 text-slate-400" /> حرارة الطفل: 
                  <input type="text" className="w-16 border rounded text-center bg-white p-0.5" value={patientTemp} onChange={(e) => setPatientTemp(e.target.value)} />
                </div>
              </div>

              {/* الشكوى والتشخيص */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1"><Activity className="h-3.5 w-3.5 text-blue-500" /> الأعراض الحالية (Symptoms / CC)</label>
                  <input type="text" className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-left font-mono" style={{ direction: 'ltr' }} placeholder="e.g. Cough, Fever, Vomiting..." value={complaint} onChange={(e) => setComplaint(e.target.value)} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5 flex items-center gap-1"><Stethoscope className="h-3.5 w-3.5 text-blue-500" /> التشخيص الطبي (Diagnosis)</label>
                  <input type="text" className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-left font-bold" style={{ direction: 'ltr' }} placeholder="e.g. Acute Tonsillitis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
                </div>
              </div>

              {/* 🔍 باني الأدوية الإحترافي (مربع الكتابة وقائمة الاستدعاء) */}
              <div className="border border-blue-200 bg-blue-50/20 p-4 rounded-xl space-y-3 relative">
                <label className="block text-xs font-black text-blue-800 flex items-center gap-1">
                  <Search className="h-4 w-4" /> محرك البحث التلقائي عن الأصناف الدوائية (كتابة أو اختيار):
                </label>
                
                <div className="relative">
                  <input 
                    type="text"
                    className="w-full p-3 rounded-xl border border-slate-200 text-xs font-bold bg-white pr-4 text-left"
                    style={{ direction: 'ltr' }}
                    placeholder="Type drug name here (e.g. Cetal, Augmentin, Brufen)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  
                  {/* نافذة الاقتراحات المنسدلة للبحث التلقائي الذكي */}
                  {filteredDrugs.length > 0 && (
                    <div className="absolute right-0 left-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-56 overflow-y-auto z-50 divide-y">
                      {filteredDrugs.map((drug) => (
                        <div
                          key={drug.id}
                          onClick={() => handleAddDrug(drug)}
                          className="w-full text-left p-3 hover:bg-blue-600 hover:text-white text-xs transition-all cursor-pointer flex justify-between items-center font-mono"
                        >
                          <span className="font-bold text-sm tracking-tight">{drug.name}</span>
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-sans group-hover:bg-blue-700">{drug.concentration}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* 📋 جدول الروشتة الحية وعرض الأصناف المضافة */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1">
                  <FileText className="h-4 w-4 text-emerald-600" /> الأصناف المضافة للروشتة الحالية:
                </h4>

                {selectedDrugsList.length === 0 ? (
                  <div className="border border-dashed p-8 rounded-xl text-center text-slate-400 text-xs">
                    لم يتم إضافة أي دواء للروشتة حتى الآن. استخدم محرك البحث بالأعلى لإدراج العلاج.
                  </div>
                ) : (
                  <div className="border rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-slate-800 text-white text-[11px] font-black">
                        <tr>
                          <th className="p-3 text-left">الصنف الدوائي (Drug Name)</th>
                          <th className="p-3 text-center">الجرعة المحسوبة للوزن</th>
                          <th className="p-3 text-center">التكرار اليومي</th>
                          <th className="p-3">تعليمات الاستخدام للطفل</th>
                          <th className="p-3 text-center">حذف</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y bg-white font-medium">
                        {selectedDrugsList.map((drug) => (
                          <tr key={drug.uniqueId} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-mono text-left font-bold text-slate-900">{drug.name} <span className="text-slate-400 text-[10px]">({drug.concentration})</span></td>
                            <td className="p-3 text-center font-black text-blue-600 bg-blue-50/30">{drug.calculatedDose}</td>
                            <td className="p-3 text-center text-slate-700">{drug.timesPerDay} مرات يومياً</td>
                            <td className="p-3 text-slate-500 font-sans">{drug.instruction}</td>
                            <td className="p-3 text-center">
                              <button type="button" onClick={() => handleRemoveDrug(drug.uniqueId)} className="text-rose-500 hover:text-rose-700 p-1 rounded-lg hover:bg-rose-50 transition-colors">
                                <Trash2 className="h-4 w-4 mx-auto" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* أزرار الإجراءات والطباعة */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button 
                  type="button" 
                  onClick={() => setCurrentPatient(null)} 
                  className="px-5 py-2.5 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-all"
                >
                  إلغاء وإغلاق الملف
                </button>
                <button 
                  type="button"
                  onClick={handleSaveAndPrint}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all"
                >
                  <Printer className="h-4 w-4" /> حفظ واعتماد طباعة الروشتة (Print Rx)
                </button>
              </div>

            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-24 text-center text-slate-400 flex flex-col items-center justify-center">
              <Stethoscope className="h-16 w-16 text-slate-300 mb-3 stroke-1 animate-bounce" />
              <h3 className="font-bold text-slate-700 text-sm">شاشة الكشف فارغة</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">الرجاء اختيار طفل من قائمة الانتظار الجانبية اليمنى لبدء الفحص الإكلينيكي واستدعاء الأدوية وحساب التركيزات فوراً.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
