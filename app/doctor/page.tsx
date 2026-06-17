'use client'

import { useState, useEffect } from 'react'
import { 
  Clock, CheckCircle, Printer, Save, UserCheck, FileText, Sparkles,
  User, Activity, Stethoscope, HeartPulse, Search, Scale, Thermometer, 
  ShieldAlert, Trash2, Settings, Plus, Ruler, Eye, X, DollarSign, TrendingUp, Calendar, UserPlus, History
} from 'lucide-react'

// --- واجهات البيانات المتكاملة ---
interface Visit {
  date: string;
  complaint: string;
  diagnosis: string;
  prescription: string;
  weight: number;
}

interface Patient {
  id: string;
  name: string;
  phone: string;
  age: string;
  weight: number;
  height: number;
  temp: string;
  type: "كشف جديد" | "إعادة واستشارة";
  history: Visit[];
  vaccines: { name: string; status: "تمت" | "مؤجلة" };
}

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
}

interface Drug {
  id: string;
  name: string;
  concentration: string;
  baseDosePerKg: number;
  timesPerDay: number;
  instruction: string;
}

// --- قاعدة البيانات الأولية الشاملة ---
const initialPatients: Patient[] = [
  {
    id: "p1", name: "يوسف أحمد محمود", phone: "01012345678", age: "سنتان", weight: 12, height: 85, temp: "38.5", type: "كشف جديد",
    history: [
      { date: "2026-04-12", complaint: "Severe diarrhea", diagnosis: "Gastroenteritis", prescription: "• Motilium Syrup (3ml)\n• ORS", weight: 11.5 }
    ],
    vaccines: { name: "تطعيم السنتين الإجباري", status: "تمت" }
  },
  {
    id: "p2", name: "فاطمة عمر إبراهيم", phone: "01198765432", age: "5 سنوات", weight: 18, height: 110, temp: "37.0", type: "إعادة واستشارة",
    history: [], vaccines: { name: "تطعيم جدري الماء", status: "مؤجلة" }
  }
];

const initialDrugs: Drug[] = [
  { id: '1', name: 'Paracetamol (Cetal) Syrup', concentration: '250mg/5ml', baseDosePerKg: 15, timesPerDay: 3, instruction: 'عند اللزوم أو كل 8 ساعات' },
  { id: '2', name: 'Augmentin 457mg Susp', concentration: '457mg/5ml', baseDosePerKg: 45, timesPerDay: 2, instruction: 'كل 12 ساعة بانتظام لمدة أسبوع' },
  { id: '3', name: 'Brufen Syrup', concentration: '100mg/5ml', baseDosePerKg: 10, timesPerDay: 3, instruction: 'بعد الأكل كخافض حرارة' },
];

export default function AdvancedDoctorDashboard() {
  const [activeTab, setActiveTab] = useState<'clinic' | 'patients-archive' | 'financials' | 'settings'>('clinic');
  
  // States النظام الرئيسي
  const [patients, setPatients] = useState<Patient[]>(initialPatients);
  const [queue, setQueue] = useState<Patient[]>(initialPatients);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [drugsDB, setDrugsDB] = useState<Drug[]>(initialDrugs);
  
  // النظام المالي
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: "e1", title: "مستلزمات طبية وجوانتي", amount: 150, category: "أدوات عيادة" },
    { id: "e2", title: "صيانة التكييف", amount: 300, category: "صيانة" }
  ]);
  const [fees, setFees] = useState({ newVisit: 300, followUp: 100 });
  const [totalRevenue, setTotalRevenue] = useState<number>(600); // كشوفات تجريبية سابقة

  // نماذج الإضافة الفورية
  const [showAddPatientModal, setShowAddPatientModal] = useState(false);
  const [newPatientForm, setNewPatientForm] = useState({ name: '', phone: '', age: '', weight: 10, height: 80, temp: '37', type: 'كشف جديد' as const });
  const [newExpenseForm, setNewExpenseForm] = useState({ title: '', amount: 0, category: 'عام' });

  // مدخلات الفحص الحالية
  const [patientWeight, setPatientWeight] = useState<number>(0);
  const [patientHeight, setPatientHeight] = useState<number>(0);
  const [patientTemp, setPatientTemp] = useState<string>('37.0');
  const [complaint, setComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [selectedDrugsList, setSelectedDrugsList] = useState<any[]>([]);
  
  // البحث المتقدم
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDrugs, setFilteredDrugs] = useState<Drug[]>([]);
  const [archiveSearch, setArchiveSearch] = useState('');
  const [searchCriteria, setSearchCriteria] = useState<'name' | 'diagnosis'>('name');

  // معالجة البحث التلقائي عن الأدوية
  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = drugsDB.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));
      setFilteredDrugs(filtered);
    } else {
      setFilteredDrugs([]);
    }
  }, [searchQuery, drugsDB]);

  const handleStartExamination = (patient: Patient) => {
    setCurrentPatient(patient);
    setPatientWeight(patient.weight);
    setPatientHeight(patient.height);
    setPatientTemp(patient.temp);
    setComplaint('');
    setDiagnosis('');
    setSelectedDrugsList([]);
  };

  const handleAddDrug = (drug: Drug) => {
    const match = drug.concentration.match(/(\d+)mg\/(\d+)ml/);
    let doseVolume = match ? (((patientWeight * drug.baseDosePerKg / drug.timesPerDay) * parseInt(match[2])) / parseInt(match[1])).toFixed(1) + " مل" : (patientWeight * 0.5).toFixed(0) + " نقطة";
    
    setSelectedDrugsList([...selectedDrugsList, {
      uniqueId: Math.random().toString(),
      name: drug.name,
      concentration: drug.concentration,
      calculatedDose: doseVolume,
      timesPerDay: drug.timesPerDay,
      instruction: drug.instruction
    }]);
    setSearchQuery('');
  };

  // إنهاء الفحص وحفظ الزيارة وتحديث الحسابات
  const handleFinalizeVisit = () => {
    if (!currentPatient) return;
    
    const newVisit: Visit = {
      date: new Date().toLocaleDateString('ar-EG'),
      complaint,
      diagnosis,
      prescription: selectedDrugsList.map((d, i) => `${i+1}- ${d.name} -> ${d.calculatedDose} / ${d.timesPerDay} daily`).join('\n'),
      weight: patientWeight
    };

    // تحديث تاريخ المريض الموحد
    const updatedPatients = patients.map(p => {
      if (p.id === currentPatient.id) {
        return { ...p, history: [newVisit, ...p.history] };
      }
      return p;
    });

    setPatients(updatedPatients);
    
    // إضافة الحسابات تلقائياً حسب نوع الكشف
    const currentFee = currentPatient.type === "كشف جديد" ? fees.newVisit : fees.followUp;
    setTotalRevenue(prev => prev + currentFee);

    // إزالة من قائمة الانتظار
    setQueue(queue.filter(p => p.id !== currentPatient.id));
    setCurrentPatient(null);
    alert('✅ تم حفظ الزيارة في السجل الطبي وتمرير الحسابات للصندوق اليومي!');
  };

  const handleAddPatientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Patient = {
      id: "p_" + Math.random().toString(),
      name: newPatientForm.name,
      phone: newPatientForm.phone,
      age: newPatientForm.age,
      weight: newPatientForm.weight,
      height: newPatientForm.height,
      temp: newPatientForm.temp,
      type: newPatientForm.type,
      history: [],
      vaccines: { name: "تطعيمات دورية منتظمة", status: "تمت" }
    };
    setPatients([created, ...patients]);
    setQueue([created, ...queue]);
    setShowAddPatientModal(false);
  };

  // حسابات الأرقام الكلية للميزانية
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const netProfit = totalRevenue - totalExpenses;

  return (
    <div className="min-h-screen bg-slate-100 text-right font-sans antialiased text-slate-800" style={{ direction: 'rtl' }}>
      
      {/* 🔝 شريط التنقل الاحترافي العلوي للنظام المالي والطبي */}
      <div className="bg-slate-900 text-white px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-blue-500/20 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg"><HeartPulse className="h-6 w-6 text-white" /></div>
          <div>
            <h1 className="text-base font-black tracking-tight">منظومة العيادة الطبية المتكاملة (PediaClinic ERP)</h1>
            <p className="text-[11px] text-blue-400 font-bold">بورد الطبيب الشامل، الأرشيف، والميزانية اليومية الموحدة</p>
          </div>
        </div>

        {/* التبديل بين الشاشات المطلوبة بدقة */}
        <div className="flex flex-wrap gap-1.5">
          <button onClick={() => setActiveTab('clinic')} className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'clinic' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            <Stethoscope className="h-4 w-4" /> غرفة الفحص الحية
          </button>
          <button onClick={() => setActiveTab('patients-archive')} className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'patients-archive' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            <History className="h-4 w-4" /> السجلات والأرشيف الطبي
          </button>
          <button onClick={() => setActiveTab('financials')} className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === 'financials' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}>
            <DollarSign className="h-4 w-4" /> الميزانية اليومية والتقارير
          </button>
        </div>
      </div>

      {/* 1️⃣ التبويب الأول: غرفة الفحص الحية والعيادة */}
      {activeTab === 'clinic' && (
        <div className="p-4 md:p-6 max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* الجانب الأيمن: قائمة الانتظار الحالية وزر تسجيل حالة */}
          <div className="lg:col-span-1 space-y-4">
            <button 
              onClick={() => setShowAddPatientModal(true)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserPlus className="h-4 w-4" /> تسجيل مريض جديد بالانتظار
            </button>

            <div className="bg-white rounded-2xl border p-4 shadow-sm">
              <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-2 text-xs">
                <Clock className="h-4 w-4 text-blue-600" /> الحالات في الانتظار بالخارج ({queue.length})
              </h3>
              <div className="mt-3 space-y-2">
                {queue.length === 0 ? (
                  <p className="text-center text-slate-400 text-xs py-4">لا توجد حالات في الانتظار حالياً.</p>
                ) : (
                  queue.map((p) => (
                    <div 
                      key={p.id} onClick={() => handleStartExamination(p)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer ${currentPatient?.id === p.id ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-slate-50 hover:bg-slate-100'}`}
                    >
                      <h4 className="font-bold text-xs">{p.name}</h4>
                      <p className="text-[11px] mt-0.5 opacity-80">النوع: <span className="font-bold">{p.type}</span> | السن: {p.age}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* الجانب الأيسر: لوحة الفحص الشامل والسوابق المرضية للمريض المختار */}
          <div className="lg:col-span-3 space-y-6">
            {currentPatient ? (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* بورد الفحص والروشتة */}
                <div className="xl:col-span-2 bg-white rounded-2xl border p-5 space-y-5 shadow-sm">
                  <div className="bg-slate-50 p-3 rounded-xl border grid grid-cols-3 gap-2 text-xs font-bold">
                    <div className="text-blue-600">الطفل الحالي: {currentPatient.name}</div>
                    <div>نوع الكشف: {currentPatient.type}</div>
                    <div className="text-left font-mono">الوزن: 
                      <input type="number" className="w-12 border text-center rounded mx-1 bg-white" value={patientWeight} onChange={(e) => setPatientWeight(parseFloat(e.target.value) || 0)} /> كجم
                    </div>
                  </div>

                  {/* حقول الفحص الطبي */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">الأعراض والشكوى الحالية:</label>
                      <input type="text" className="w-full p-2 rounded-lg border text-xs" placeholder="e.g. Cough, Fever" value={complaint} onChange={(e) => setComplaint(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 mb-1">التشخيص الحالي (Diagnosis):</label>
                      <input type="text" className="w-full p-2 rounded-lg border text-xs text-left font-bold" style={{ direction: 'ltr' }} placeholder="e.g. Acute Tonsillitis" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} />
                    </div>
                  </div>

                  {/* محرك البحث عن الأدوية والجرعة التلقائية */}
                  <div className="bg-blue-50/40 p-3 rounded-xl border border-blue-100 relative">
                    <label className="block text-[11px] font-black text-blue-800 mb-1">🔍 محرك البحث الذكي التلقائي عن صنف العلاج:</label>
                    <input type="text" className="w-full p-2 rounded-lg border bg-white text-xs text-left font-mono" placeholder="Type first letters..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    
                    {filteredDrugs.length > 0 && (
                      <div className="absolute right-3 left-3 mt-1 bg-white border rounded-xl shadow-xl max-h-40 overflow-y-auto z-50 divide-y">
                        {filteredDrugs.map(d => (
                          <div key={d.id} onClick={() => handleAddDrug(d)} className="p-2 hover:bg-blue-600 hover:text-white font-mono text-xs text-left cursor-pointer flex justify-between">
                            <span>{d.name}</span><strong>{d.concentration}</strong>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* جدول الأدوية المضافة */}
                  <div className="border rounded-xl overflow-hidden text-xs">
                    <table className="w-full text-right">
                      <thead className="bg-slate-800 text-white text-[10px]">
                        <tr><th className="p-2">الصنف</th><th className="p-2 text-center">الجرعة للوزن</th><th className="p-2 text-center">التعليمات</th></tr>
                      </thead>
                      <tbody className="divide-y bg-white">
                        {selectedDrugsList.map((d, i) => (
                          <tr key={i}>
                            <td className="p-2 font-mono text-left">{d.name}</td>
                            <td className="p-2 text-center text-blue-600 font-bold bg-blue-50/20">{d.calculatedDose}</td>
                            <td className="p-2 text-slate-500">{d.instruction}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <button onClick={handleFinalizeVisit} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" /> اعتماد الكشف وإنهاء الحالة للطباعة
                    </button>
                  </div>
                </div>

                {/* 📜 سوابق المرضى والزيارات القديمة والتطعيمات في نفس اللحظة */}
                <div className="xl:col-span-1 bg-white rounded-2xl border p-4 space-y-4 shadow-sm">
                  <h3 className="font-bold text-slate-800 border-b pb-2 flex items-center gap-1.5 text-xs text-blue-600">
                    <History className="h-4 w-4" /> التاريخ المرضي السلوكي (Patient History)
                  </h3>
                  
                  {/* التطعيمات */}
                  <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-xs">
                    <span className="font-bold text-amber-800 block">🛡️ حالة تطعيمات الطفل المجدولة:</span>
                    <div className="flex justify-between items-center mt-1">
                      <span>{currentPatient.vaccines.name}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${currentPatient.vaccines.status === 'تمت' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>{currentPatient.vaccines.status}</span>
                    </div>
                  </div>

                  {/* شريط الزيارات السابقة */}
                  <div className="space-y-3 max-h-80 overflow-y-auto">
                    <span className="text-[11px] font-bold text-slate-400 block">🗓️ زيارات سابقة مسجلة للملف للطفل:</span>
                    {currentPatient.history.length === 0 ? (
                      <p className="text-[11px] text-slate-400">لا توجد زيارات سابقة مسجلة (ملف طفل جديد أول مرة).</p>
                    ) : (
                      currentPatient.history.map((h, idx) => (
                        <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                          <div className="flex justify-between text-slate-500 font-bold text-[10px]"><span>التاريخ: {h.date}</span><span>الوزن: {h.weight} كجم</span></div>
                          <p className="font-bold text-slate-800">التشخيص: <span className="text-rose-600">{h.diagnosis}</span></p>
                          <p className="text-[11px] text-slate-400 whitespace-pre-line">{h.prescription}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="bg-white border border-dashed rounded-2xl p-24 text-center text-slate-400 flex flex-col items-center justify-center">
                <Stethoscope className="h-14 w-14 mb-2 stroke-1 text-slate-300 animate-pulse" />
                <h3 className="font-bold text-xs text-slate-700">شاشة العيادة خالية</h3>
                <p className="text-[11px] mt-1">اختر طفلاً من قائمة الانتظار على اليمين لبدء الكشف واستدعاء التاريخ المرضي والجرعات مباشرة.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2️⃣ التبويب الثاني: أرشيف المرضى والبحث المتقدم بالمرض والتشخيص */}
      {activeTab === 'patients-archive' && (
        <div className="p-4 md:p-6 max-w-[1400px] mx-auto space-y-4">
          <div className="bg-white rounded-2xl border p-6 shadow-sm">
            <h2 className="text-sm font-black text-slate-900 border-b pb-3 flex items-center gap-1.5"><History className="h-5 w-5 text-blue-600" /> أرشيف وقاعدة بيانات السجلات الشاملة لجميع الأطفال</h2>
            
            {/* أداة الفلترة المتقدمة (بالاسم أو المرض) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 bg-slate-50 p-4 rounded-xl border">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">طريقة البحث والفرز المتقدم:</label>
                <select className="w-full p-2 text-xs border rounded-lg bg-white" value={searchCriteria} onChange={(e: any) => setSearchCriteria(e.target.value)}>
                  <option value="name">البحث باسم الطفل أو رقم الهاتف</option>
                  <option value="diagnosis">البحث بتشخيص مرضي معين (مثال: Gastroenteritis)</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold text-slate-600 mb-1">اكتب كلمة البحث هنا:</label>
                <input 
                  type="text" className="w-full p-2 text-xs border rounded-lg" placeholder="ابدأ كتابة أحرف البحث للحصول على نتائج الأرشيف..."
                  value={archiveSearch} onChange={(e) => setArchiveSearch(e.target.value)}
                />
              </div>
            </div>

            {/* جدول عرض النتائج الشامل للبحث */}
            <div className="mt-4 border rounded-xl overflow-hidden text-xs">
              <table className="w-full text-right">
                <thead className="bg-slate-800 text-white text-[11px]">
                  <tr>
                    <th className="p-3">اسم الطفل الكود</th>
                    <th className="p-3">رقم الهاتف للاتصال</th>
                    <th className="p-3">السن</th>
                    <th className="p-3">عدد الزيارات الإجمالية بالملف</th>
                    <th className="p-3">آخر تشخيص طبي مسجل لها</th>
                  </tr>
                </thead>
                <tbody className="divide-y bg-white">
                  {patients
                    .filter(p => {
                      if (searchCriteria === 'name') {
                        return p.name.toLowerCase().includes(archiveSearch.toLowerCase()) || p.phone.includes(archiveSearch);
                      } else {
                        return p.history.some(h => h.diagnosis.toLowerCase().includes(archiveSearch.toLowerCase()));
                      }
                    })
                    .map((p, index) => (
                      <tr key={index} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-bold text-slate-900">{p.name}</td>
                        <td className="p-3 text-slate-500 font-mono">{p.phone}</td>
                        <td className="p-3">{p.age}</td>
                        <td className="p-3 text-center"><span className="bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full text-[10px]">{p.history.length + 1} زيارة</span></td>
                        <td className="p-3 font-mono text-left text-rose-600 font-bold">{p.history[0]?.diagnosis || "كشف جديد تماماً"}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3️⃣ التبويب الثالث: النظام المالي والميزانية والمصروفات الحقيقية */}
      {activeTab === 'financials' && (
        <div className="p-4 md:p-6 max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* كروت التقارير المالية الكلية الذكية */}
          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-400 text-[11px] font-bold block">إجمالي إيرادات الكشوفات اليوم</span>
                <h3 className="text-xl font-black text-emerald-600 mt-1">{totalRevenue} ج.م</h3>
              </div>
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-slate-400 text-[11px] font-bold block">إجمالي المصروفات والنثريات</span>
                <h3 className="text-xl font-black text-rose-600 mt-1">{totalExpenses} ج.م</h3>
              </div>
              <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm bg-blue-50/10">
                <span className="text-blue-700 text-[11px] font-bold block">الصافي المالي الفعلي للعيادة</span>
                <h3 className="text-xl font-black text-blue-700 mt-1">{netProfit} ج.م</h3>
              </div>
            </div>

            {/* جدول المصروفات والنثريات اليومية */}
            <div className="bg-white rounded-2xl border p-4 shadow-sm">
              <h3 className="text-xs font-black text-slate-800 border-b pb-2 mb-3">📋 قائمة النثريات والمصروفات التشغيلية اليومية:</h3>
              <div className="border rounded-xl overflow-hidden text-xs">
                <table className="w-full text-right">
                  <thead className="bg-slate-100 text-slate-700 font-bold">
                    <tr><th className="p-2.5">البند والمصروف</th><th className="p-2.5">الفئة</th><th className="p-2.5 text-center">المبلغ المدفوع</th></tr>
                  </thead>
                  <tbody className="divide-y bg-white">
                    {expenses.map((e) => (
                      <tr key={e.id}>
                        <td className="p-2.5 font-medium">{e.title}</td>
                        <td className="p-2.5 text-slate-400">{e.category}</td>
                        <td className="p-2.5 text-center font-bold text-rose-600">{e.amount} ج.م</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* نموذج إدخال وإدراج بند مصروفات جديد للصندوق */}
          <div className="lg:col-span-1 bg-white rounded-2xl border p-5 shadow-sm h-fit">
            <h3 className="text-xs font-black text-slate-900 border-b pb-2 flex items-center gap-1"><DollarSign className="h-4 w-4 text-rose-500" /> تسجيل بند نثريات/مصروفات جديد:</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              if(!newExpenseForm.title || newExpenseForm.amount<=0) return;
              setExpenses([...expenses, { id: Math.random().toString(), ...newExpenseForm }]);
              setNewExpenseForm({ title: '', amount: 0, category: 'عام' });
            }} className="space-y-3 mt-3 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">وصف البند والمصروف الافتراضي:</label>
                <input type="text" required className="w-full p-2 border rounded-lg" placeholder="مثال: فاتورة الكهرباء أو شراء قطن طبى" value={newExpenseForm.title} onChange={(e) => setNewExpenseForm({...newExpenseForm, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">المبلغ المدفوع (ج.م):</label>
                <input type="number" required className="w-full p-2 border rounded-lg" value={newExpenseForm.amount || ''} onChange={(e) => setNewExpenseForm({...newExpenseForm, amount: parseFloat(e.target.value) || 0})} />
              </div>
              <button type="submit" className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs tracking-wide shadow-sm">+ إدراج بند الصرف وتحديث الميزانية</button>
            </form>
          </div>
        </div>
      )}

      {/* 4️⃣ النافذة المنبثقة لإدراج مريض جديد لقائمة الانتظار */}
      {showAddPatientModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <form onSubmit={handleAddPatientSubmit} className="bg-white rounded-2xl max-w-md w-full border shadow-2xl p-5 space-y-4 text-xs">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="font-black text-sm text-slate-900 flex items-center gap-1"><UserPlus className="h-4 w-4 text-blue-600" /> فتح تذكرة فحص لطفل جديد بالانتظار</h3>
              <button type="button" onClick={() => setShowAddPatientModal(false)}><X className="h-4 w-4 text-slate-400" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold mb-1">اسم الطفل ثلاثي أو ثنائي:</label>
                <input type="text" required className="w-full p-2 border rounded-lg" placeholder="مثال: يوسف محمد عبد الرحمن" value={newPatientForm.name} onChange={(e) => setNewPatientForm({...newPatientForm, name: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1">رقم الهاتف لولي الأمر:</label>
                  <input type="text" required className="w-full p-2 border rounded-lg" placeholder="010..." value={newPatientForm.phone} onChange={(e) => setNewPatientForm({...newPatientForm, phone: e.target.value})} />
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">السن أو العمر الحركي:</label>
                  <input type="text" required className="w-full p-2 border rounded-lg" placeholder="مثال: 3 سنوات أو 6 أشهر" value={newPatientForm.age} onChange={(e) => setNewPatientForm({...newPatientForm, age: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold mb-1">نوع التذكرة الحالية:</label>
                  <select className="w-full p-2 border rounded-lg bg-white" value={newPatientForm.type} onChange={(e: any) => setNewPatientForm({...newPatientForm, type: e.target.value})}>
                    <option value="كشف جديد">كشف جديد عيادي</option>
                    <option value="إعادة واستشارة">إعادة واستشارة دورية</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold mb-1">الوزن التقريبي بالخارج (كجم):</label>
                  <input type="number" required className="w-full p-2 border rounded-lg" value={newPatientForm.weight} onChange={(e) => setNewPatientForm({...newPatientForm, weight: parseFloat(e.target.value) || 10})} />
                </div>
              </div>
            </div>
            <button type="submit" className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl tracking-wide shadow-md">إرسال الطفل فوراً لقائمة الانتظار بالخارج</button>
          </form>
        </div>
      )}

    </div>
  );
}
