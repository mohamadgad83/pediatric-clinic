'use client'

import { useState, useEffect } from 'react'
import { 
  Clock, CheckCircle, Printer, Save, UserCheck, FileText, Sparkles,
  User, Activity, Stethoscope, HeartPulse, Search, Scale, Thermometer, 
  ShieldAlert, Trash2, Settings, Plus, Ruler, Eye, X
} from 'lucide-react'

// واجهات البيانات
interface Drug {
  id: string;
  name: string;
  concentration: string;
  baseDosePerKg: number;
  timesPerDay: number;
  instruction: string;
}

interface DiagnosisPreset {
  id: string;
  title: string;
  eng: string;
}

interface SelectedDrug {
  uniqueId: string;
  name: string;
  concentration: string;
  calculatedDose: string;
  timesPerDay: number;
  instruction: string;
}

// البيانات الأولية الافتراضية لقاعدة البيانات
const initialDrugs: Drug[] = [
  { id: '1', name: 'Paracetamol (Cetal) Syrup', concentration: '250mg/5ml', baseDosePerKg: 15, timesPerDay: 3, instruction: 'عند اللزوم أو كل 8 ساعات' },
  { id: '2', name: 'Paracetamol (Paramol) Drops', concentration: '100mg/1ml', baseDosePerKg: 15, timesPerDay: 4, instruction: 'نقاط بالفم عند السخونية' },
  { id: '3', name: 'Amoxicillin (E-Mox) 250mg Susp', concentration: '250mg/5ml', baseDosePerKg: 40, timesPerDay: 3, instruction: 'بعد الأكل بانتظام لمدة 7 أيام' },
  { id: '4', name: 'Augmentin 457mg Susp', concentration: '457mg/5ml', baseDosePerKg: 45, timesPerDay: 2, instruction: 'كل 12 ساعة بانتظام لمدة أسبوع' },
  { id: '5', name: 'Brufen Syrup', concentration: '100mg/5ml', baseDosePerKg: 10, timesPerDay: 3, instruction: 'بعد الأكل كخافض حرارة' },
]

const initialDiagnoses: DiagnosisPreset[] = [
  { id: '1', title: 'التهاب حاد باللوزتين', eng: 'Acute Tonsillitis' },
  { id: '2', title: 'نزلة معوية حادة', eng: 'Acute Gastroenteritis' },
  { id: '3', title: 'التهاب الشعب الهوائية', eng: 'Acute Bronchiolitis' },
]

const initialQueue = [
  { id: 1, name: "يوسف أحمد محمود", age: "سنتان", weight: 12, height: 85, temp: "38.5", type: "كشف جديد" },
  { id: 2, name: "فاطمة عمر إبراهيم", age: "5 سنوات", weight: 18, height: 110, temp: "37.0", type: "إعادة واستشارة" },
  { id: 3, name: "آدم مصطفى كريم", age: "8 أشهر", weight: 8, height: 68, temp: "39.1", type: "كشف جديد" },
]

export default function DoctorDashboard() {
  const [activeView, setActiveView] = useState<'clinic' | 'database'>('clinic')
  const [queue, setQueue] = useState(initialQueue)
  const [currentPatient, setCurrentPatient] = useState<typeof initialQueue[0] | null>(null)
  
  // قواعد البيانات الديناميكية (Dynamic State)
  const [drugsDB, setDrugsDB] = useState<Drug[]>(initialDrugs)
  const [diagnosesDB, setDiagnosesDB] = useState<DiagnosisPreset[]>(initialDiagnoses)

  // نماذج الإضافة لقاعدة البيانات الجديدة
  const [newDrug, setNewDrug] = useState({ name: '', concentration: '250mg/5ml', baseDosePerKg: 15, timesPerDay: 3, instruction: '' })
  const [newDiag, setNewDiag] = useState({ title: '', eng: '' })

  // علامات فحص الحالة النشطة
  const [patientWeight, setPatientWeight] = useState<number>(0)
  const [patientHeight, setPatientHeight] = useState<number>(0)
  const [patientTemp, setPatientTemp] = useState<string>('37.0')
  const [complaint, setComplaint] = useState('')
  const [diagnosis, setDiagnosis] = useState('')
  
  // محرك البحث والروشتة
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredDrugs, setFilteredDrugs] = useState<Drug[]>([])
  const [selectedDrugsList, setSelectedDrugsList] = useState<SelectedDrug[]>([])
  const [showPrintModal, setShowPrintModal] = useState(false)

  // مراقبة البحث التلقائي الفوري عن الأدوية
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = drugsDB.filter(drug => 
        drug.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredDrugs(filtered)
    } else {
      setFilteredDrugs([])
    }
  }, [searchQuery, drugsDB])

  // حساب مؤشر كتلة الجسم التلقائي (BMI) للطفل
  const calculateBMI = () => {
    if (!patientWeight || !patientHeight) return '0.0'
    const heightInMeters = patientHeight / 100
    return (patientWeight / (heightInMeters * heightInMeters)).toFixed(1)
  }

  const handleStartExamination = (patient: typeof initialQueue[0]) => {
    setCurrentPatient(patient)
    setPatientWeight(patient.weight)
    setPatientHeight(patient.height)
    setPatientTemp(patient.temp)
    setComplaint('')
    setDiagnosis('')
    setSelectedDrugsList([])
    setSearchQuery('')
  }

  // حساب معادلة جرعة الأطفال وإضافتها للجدول
  const handleAddDrug = (drug: Drug) => {
    if (!patientWeight || patientWeight <= 0) {
      alert('يرجى كتابة وزن الطفل أولاً لحساب الجرعة بدقة!')
      return
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

  // إضافة دواء جديد لقاعدة البيانات من داخل التطبيق
  const handleAddNewDrugToDB = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDrug.name) return
    const created: Drug = {
      id: Math.random().toString(),
      ...newDrug
    }
    setDrugsDB([...drugsDB, created])
    setNewDrug({ name: '', concentration: '250mg/5ml', baseDosePerKg: 15, timesPerDay: 3, instruction: '' })
    alert('✅ تم إضافة الصنف الجديد بنجاح لقاعدة بيانات العيادة!')
  }

  // إضافة تشخيص جديد لقاعدة البيانات
  const handleAddNewDiagToDB = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDiag.title || !newDiag.eng) return
    const created: DiagnosisPreset = {
      id: Math.random().toString(),
      ...newDiag
    }
    setDiagnosesDB([...diagnosesDB, created])
    setNewDiag({ title: '', eng: '' })
    alert('✅ تم إضافة التشخيص الجديد بنجاح!')
  }

  return (
    <div className="min-h-screen bg-slate-50 text-right font-sans antialiased text-slate-800" style={{ direction: 'rtl' }}>
      
      {/* هيدر المنظومة الرئيسي */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-b border-blue-500/30 gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-md"><HeartPulse className="h-6 w-6 text-white" /></div>
          <div>
            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-2 py-0.5 rounded-md text-[10px] font-bold">Smart Clinic v3.0</span>
            <h1 className="text-lg font-black tracking-tight mt-0.5">منظومة العيادة الذكية المتقدمة لطب الأطفال</h1>
          </div>
        </div>

        {/* أزرار التحويل بين العيادة وإدخال البيانات */}
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveView('clinic')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeView === 'clinic' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <Stethoscope className="h-4 w-4" /> شاشة الفحص والعيادة
          </button>
          <button 
            onClick={() => setActiveView('database')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeView === 'database' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            <Settings className="h-4 w-4" /> إدارة قواعد البيانات ({drugsDB.length} صنف)
          </button>
        </div>
      </div>

      {/* 1️⃣ العرض الأول: شاشة العيادة والفحص والكشف */}
      {activeView === 'clinic' && (
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* الجانب الأيمن: قائمة الحالات */}
          <div className="lg:col-span-1 bg-white rounded-2xl border p-4 shadow-sm h-fit">
            <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4 text-blue-600" /> قائمة انتظار الأطفال اليوم ({queue.length})
            </h3>
            <div className="mt-3 space-y-2.5">
              {queue.map((p) => (
                <div 
                  key={p.id} onClick={() => handleStartExamination(p)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${currentPatient?.id === p.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 hover:bg-slate-100'}`}
                >
                  <div>
                    <h4 className="font-bold text-sm">{p.name}</h4>
                    <p className="text-xs mt-1 opacity-80">السن: {p.age} | الوزن: {p.weight} كجم</p>
                  </div>
                  <span className="bg-white text-slate-700 px-2 py-0.5 rounded border text-xs font-bold">{p.temp}°م</span>
                </div>
              ))}
            </div>
          </div>

          {/* الجانب الأيسر: بورد الكشف الطبي الشامل */}
          <div className="lg:col-span-3">
            {currentPatient ? (
              <div className="bg-white rounded-2xl border p-6 space-y-6 shadow-sm">
                
                {/* لوحة قياسات جسم الطفل الذكية */}
                <div className="bg-slate-50 p-4 rounded-xl grid grid-cols-2 md:grid-cols-5 gap-4 text-xs font-bold text-slate-700 border">
                  <div>الطفل: <span className="text-blue-600 font-black block text-sm mt-0.5">{currentPatient.name}</span></div>
                  <div>السن الحالي: <span className="text-slate-900 block text-sm mt-0.5">{currentPatient.age}</span></div>
                  <div>
                    <span className="flex items-center gap-1"><Scale className="h-3.5 w-3.5 text-slate-400" /> الوزن (كجم)</span>
                    <input type="number" className="w-full border rounded p-1 bg-white text-blue-600 font-black mt-0.5 text-center" value={patientWeight} onChange={(e) => setPatientWeight(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div>
                    <span className="flex items-center gap-1"><Ruler className="h-3.5 w-3.5 text-slate-400" /> الطول (سم)</span>
                    <input type="number" className="w-full border rounded p-1 bg-white mt-0.5 text-center" value={patientHeight} onChange={(e) => setPatientHeight(parseFloat(e.target.value) || 0)} />
                  </div>
                  <div className="bg-blue-50/60 p-2 rounded-lg text-center border border-blue-100">
                    <span className="text-blue-700 text-[10px]">مؤشر كتلة الجسم BMI</span>
                    <span className="block text-sm font-black text-blue-800 mt-0.5">{calculateBMI()}</span>
                  </div>
                </div>

                {/* التشخيص السريع بنقرة واحدة */}
                <div>
                  <span className="block text-xs font-bold text-slate-500 mb-2">💡 استدعاء تشخيص طبي مخزن وقالب جاهز:</span>
                  <div className="flex flex-wrap gap-2">
                    {diagnosesDB.map((diag) => (
                      <button 
                        key={diag.id} type="button" onClick={() => setDiagnosis(diag.eng)}
                        className="bg-slate-100 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
                      >
                        {diag.title} ({diag.eng})
                      </button>
                    ))}
                  </div>
                </div>

                {/* حقول التشخيص الطبي */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">الشكوى الإكلينيكية (Chief Complaint)</label>
                    <input type="text" className="w-full p-2.5 rounded-xl border text-xs font-mono text-left" style={{ direction: 'ltr' }} placeholder="e.g. Fever, persistent cough" value={complaint} onChange={(e) => setComplaint(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1.5">التشخيص الحالي (Diagnosis)</label>
                    <input type="text" className="w-full p-2.5 rounded-xl border text-xs font-bold text-left" style={{ direction: 'ltr' }} placeholder="e.g. Acute Gastroenteritis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
                  </div>
                </div>

                {/* محرك البحث عن الأدوية من قاعدة البيانات */}
                <div className="border border-blue-200 bg-blue-50/20 p-4 rounded-xl space-y-2 relative">
                  <label className="block text-xs font-black text-blue-800 flex items-center gap-1">
                    <Search className="h-4 w-4" /> اكتب أول حرفين من اسم الدواء المقترح وسيتم حساب التركيز تلقائياً:
                  </label>
                  <input 
                    type="text" className="w-full p-3 rounded-xl border font-bold text-xs text-left" style={{ direction: 'ltr' }}
                    placeholder="Search by drug name (e.g. Cetal, Augmentin)..."
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  {/* نتائج البحث المنبثقة من قاعدة البيانات المحدثة */}
                  {filteredDrugs.length > 0 && (
                    <div className="absolute right-4 left-4 mt-1 bg-white border rounded-xl shadow-2xl max-h-48 overflow-y-auto z-50 divide-y">
                      {filteredDrugs.map((drug) => (
                        <div 
                          key={drug.id} onClick={() => handleAddDrug(drug)}
                          className="p-3 hover:bg-blue-600 hover:text-white text-xs font-mono text-left cursor-pointer flex justify-between items-center"
                        >
                          <span className="font-bold text-sm">{drug.name}</span>
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px]">{drug.concentration}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* جدول الروشتة وعرض العلاج الحلي */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1"><FileText className="h-4 w-4 text-emerald-600" /> الأصناف المضافة للروشتة الحالية:</h4>
                  {selectedDrugsList.length === 0 ? (
                    <div className="border border-dashed p-8 rounded-xl text-center text-slate-400 text-xs">لا يوجد أدوية مضافة حالياً. ابحث بالأعلى لإدراج العلاج وجرعته.</div>
                  ) : (
                    <div className="border rounded-xl overflow-hidden shadow-sm">
                      <table className="w-full text-right text-xs">
                        <thead className="bg-slate-800 text-white text-[11px]">
                          <tr>
                            <th className="p-3 text-left">اسم الدواء والتركيز</th>
                            <th className="p-3 text-center">الجرعة حسب الوزن</th>
                            <th className="p-3 text-center">التكرار</th>
                            <th className="p-3">التعليمات للمنزل</th>
                            <th className="p-3 text-center">حذف</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y bg-white">
                          {selectedDrugsList.map((drug) => (
                            <tr key={drug.uniqueId} className="hover:bg-slate-50">
                              <td className="p-3 font-mono text-left font-bold text-slate-900">{drug.name} <span className="text-slate-400 text-[10px]">({drug.concentration})</span></td>
                              <td className="p-3 text-center font-black text-blue-600 bg-blue-50/20">{drug.calculatedDose}</td>
                              <td className="p-3 text-center text-slate-700">{drug.timesPerDay} مرات يومياً</td>
                              <td className="p-3 text-slate-500">{drug.instruction}</td>
                              <td className="p-3 text-center">
                                <button type="button" onClick={() => setSelectedDrugsList(selectedDrugsList.filter(d => d.uniqueId !== drug.uniqueId))} className="text-rose-500 hover:text-rose-700"><Trash2 className="h-4 w-4 mx-auto" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* أزرار الحفظ والاعتماد وعرض الروشتة للطباعة */}
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <button type="button" onClick={() => setCurrentPatient(null)} className="px-4 py-2 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100">إغلاق بدون حفظ</button>
                  <button 
                    type="button" disabled={selectedDrugsList.length === 0}
                    onClick={() => setShowPrintModal(true)}
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    <Eye className="h-4 w-4" /> معاينة وطباعة الروشتة الورقية
                  </button>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-24 text-center text-slate-400 flex flex-col items-center justify-center">
                <Stethoscope className="h-14 w-14 text-slate-300 mb-2 stroke-1 animate-pulse" />
                <h3 className="font-bold text-sm text-slate-700">شاشة الفحص جاهزة</h3>
                <p className="text-xs text-slate-400 max-w-xs mt-1 leading-relaxed">الرجاء تحديد طفل من قائمة الانتظار الجانبية للبدء في تفعيل بروتوكول حساب الجرعات الإكلينيكي فوراً.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2️⃣ العرض الثاني: لوحة تحكم إدخال وإدارة قواعد البيانات */}
      {activeView === 'database' && (
        <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-6">
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <h2 className="text-base font-black text-slate-900 border-b pb-3 flex items-center gap-2"><Settings className="h-5 w-5 text-blue-600" /> لوحة التحكم في بنك مدخلات العيادة (الأدوية والتشخيصات)</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
              
              {/* قسم إضافة وتعديل الأدوية */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg w-fit">➕ إدخال صنف دواء جديد في السيستم:</h3>
                <form onSubmit={handleAddNewDrugToDB} className="space-y-3 bg-slate-50 p-4 rounded-xl border">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">اسم الدواء العلمي/التجاري:</label>
                    <input type="text" required className="w-full p-2 rounded-lg border text-xs text-left" style={{ direction: 'ltr' }} placeholder="e.g. Zithromax 200mg/5ml Susp" value={newDrug.name} onChange={(e) => setNewDrug({...newDrug, name: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">التركيز الحالي المتاح:</label>
                      <input type="text" required className="w-full p-2 rounded-lg border text-xs text-left" style={{ direction: 'ltr' }} placeholder="e.g. 250mg/5ml" value={newDrug.concentration} onChange={(e) => setNewDrug({...newDrug, concentration: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">الجرعة (مجم لكل 1 كجم من وزن الطفل):</label>
                      <input type="number" required className="w-full p-2 rounded-lg border text-xs" value={newDrug.baseDosePerKg} onChange={(e) => setNewDrug({...newDrug, baseDosePerKg: parseInt(e.target.value) || 0})} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">عدد المرات في اليوم:</label>
                      <input type="number" required className="w-full p-2 rounded-lg border text-xs" value={newDrug.timesPerDay} onChange={(e) => setNewDrug({...newDrug, timesPerDay: parseInt(e.target.value) || 1})} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">تعليمات الاستخدام الافتراضية:</label>
                      <input type="text" required className="w-full p-2 rounded-lg border text-xs" placeholder="مثال: بعد الأكل بانتظام" value={newDrug.instruction} onChange={(e) => setNewDrug({...newDrug, instruction: e.target.value})} />
                    </div>
                  </div>
                  <button type="submit" className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"><Plus className="h-4 w-4" /> حفظ وإدراج الدواء في قاعدة البيانات</button>
                </form>

                {/* استعراض الأدوية الحالية */}
                <h4 className="text-xs font-bold text-slate-700 pt-2">الأصناف المسجلة في بنك الأدوية الحالي ({drugsDB.length}):</h4>
                <div className="border rounded-xl max-h-60 overflow-y-auto divide-y bg-white text-xs">
                  {drugsDB.map(d => (
                    <div key={d.id} className="p-2.5 flex justify-between items-center hover:bg-slate-50 font-mono">
                      <span>{d.name} <strong className="text-blue-600 font-sans">({d.concentration})</strong></span>
                      <button onClick={() => setDrugsDB(drugsDB.filter(item => item.id !== d.id))} className="text-rose-500 hover:text-rose-700"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

              {/* قسم إضافة التشخيصات */}
              <div className="space-y-4">
                <h3 className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg w-fit">➕ إضافة قوالب تشخيصية شائعة جديدة:</h3>
                <form onSubmit={handleAddNewDiagToDB} className="space-y-3 bg-slate-50 p-4 rounded-xl border">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">اسم المرض بالعربية (لزر الاستدعاء):</label>
                    <input type="text" required className="w-full p-2 rounded-lg border text-xs" placeholder="مثال: نزلة معوية حادة" value={newDiag.title} onChange={(e) => setNewDiag({...newDiag, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">الاسم الطبي المعتمد بالإنجليزية (الذي يظهر بالروشتة):</label>
                    <input type="text" required className="w-full p-2 rounded-lg border text-xs text-left font-bold" style={{ direction: 'ltr' }} placeholder="e.g. Acute Gastroenteritis" value={newDiag.eng} onChange={(e) => setNewDiag({...newDiag, eng: e.target.value})} />
                  </div>
                  <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"><Plus className="h-4 w-4" /> حفظ وإدراج التشخيص</button>
                </form>

                <h4 className="text-xs font-bold text-slate-700 pt-2">التشخيصات المسجلة حالياً:</h4>
                <div className="border rounded-xl max-h-60 overflow-y-auto divide-y bg-white text-xs">
                  {diagnosesDB.map(d => (
                    <div key={d.id} className="p-2.5 flex justify-between items-center hover:bg-slate-50">
                      <span>{d.title} — <strong className="text-slate-500 font-mono text-[11px]">{d.eng}</strong></span>
                      <button onClick={() => setDiagnosesDB(diagnosesDB.filter(item => item.id !== d.id))} className="text-rose-500 hover:text-rose-700"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 3️⃣ نافذة منبثقة (Modal) لمعاينة وطباعة الروشتة الحقيقية للعيادة */}
      {showPrintModal && currentPatient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full border shadow-2xl p-6 relative flex flex-col justify-between min-h-[550px]">
            
            {/* رأس الروشتة الرسمية للعيادة */}
            <div>
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4 mb-4">
                <div className="text-right">
                  <h2 className="text-base font-black text-slate-900">عيادة الأطفال التخصصية</h2>
                  <p className="text-[10px] text-slate-500 font-bold mt-0.5">د. محمد جاد | استشاري طب الأطفال وحديثي الولادة</p>
                </div>
                <div className="text-left text-[10px] text-slate-400 font-mono">
                  <p>Date: {new Date().toLocaleDateString('en-US')}</p>
                  <p>Rx ID: #{Math.floor(Math.random() * 90000) + 10000}</p>
                </div>
              </div>

              {/* بيانات الطفل بالروشتة */}
              <div className="bg-slate-100 p-2.5 rounded-lg grid grid-cols-3 gap-2 text-[11px] font-bold text-slate-700 mb-6">
                <div>الطفل: <span className="text-slate-900">{currentPatient.name}</span></div>
                <div>السن: <span className="text-slate-900">{currentPatient.age}</span></div>
                <div>الوزن الحالي: <span className="text-blue-600 font-black">{patientWeight} كجم</span></div>
              </div>

              {/* علامة الـ Rx وجدول العلاج الطبية */}
              <div className="space-y-4">
                <div className="text-xl font-serif font-black text-slate-900 border-b pb-1 w-fit pr-2">Rx:</div>
                <div className="space-y-3 pl-4">
                  {selectedDrugsList.map((drug, idx) => (
                    <div key={idx} className="font-mono text-left" style={{ direction: 'ltr' }}>
                      <p className="font-bold text-xs text-slate-900">{idx + 1}. {drug.name} ({drug.concentration})</p>
                      <p className="text-[11px] text-blue-600 font-sans font-black pl-4 mt-0.5">
                        ➔ Take {drug.calculatedDose} — {drug.timesPerDay} times daily. ({drug.instruction})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* أزرار الإغلاق والطباعة الحقيقية للملف */}
            <div className="flex gap-2 pt-4 border-t border-dashed mt-6">
              <button 
                type="button" onClick={() => setShowPrintModal(false)}
                className="w-1/3 py-2 border rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 flex justify-center items-center gap-1"
              >
                <X className="h-4 w-4" /> إغلاق المعاينة
              </button>
              <button 
                type="button" 
                onClick={() => {
                  window.print()
                  setShowPrintModal(false)
                  setQueue(queue.filter(p => p.id !== currentPatient.id))
                  setCurrentPatient(null)
                }}
                className="w-2/3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs shadow-md flex justify-center items-center gap-1.5"
              >
                <Printer className="h-4 w-4" /> أمر الطباعة وإخلاء الحالة فوراً
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}
