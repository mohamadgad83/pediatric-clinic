'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { User, Calendar, FileText, Activity, Thermometer, Weight, Calculator, Check } from 'lucide-react';

export default function PatientMedicalProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // حالة حاسبة الجرعات الذكية والروشتة
  const [weightInput, setWeightInput] = useState('');
  const [selectedDrug, setSelectedDrug] = useState('');
  const [calculatedDose, setCalculatedDose] = useState('');
  const [complaint, setComplaint] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // قائمة الأدوية وحساباتها الدقيقة المعتمدة
  const pediatricDrugs = [
    { name: 'Paracetamol (سيتال شراب)', factor: 0.15, note: 'يعطى 3-4 مرات يومياً عند اللزوم (0.15 مل لكل كجم من وزن الطفل)' },
    { name: 'Ibuprofen (بروفين شراب)', factor: 0.1, note: 'يعطى 3 مرات يومياً بعد الأكل (0.1 مل لكل كجم من وزن الطفل)' },
    { name: 'Amoxicillin (أميرextended شراب 250مج)', factor: 0.15, note: 'مضاد حيوي يعطى كل 8 ساعات لمدة 7 أيام (حسب شدة الحالة)' },
  ];

  useEffect(() => {
    async function loadPatientFullData() {
      setLoading(true);
      const { data: patientData } = await supabase
        .from('clinic_patients')
        .select('*')
        .eq('id', id)
        .single();

      const { data: visitsData } = await supabase
        .from('clinic_appointments')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false });

      if (patientData) {
        setPatient(patientData);
        if (patientData.weight) setWeightInput(patientData.weight.toString());
      }
      if (visitsData) {
        setAppointments(visitsData);
        if (visitsData.length > 0) setSelectedVisit(visitsData[0]);
      }
      setLoading(false);
    }
    loadPatientFullData();
  }, [id]);

  // دالة احتساب الجرعة الآمنة فورياً بناءً على الوزن الحالي للطفل
  const handleCalculate = (drugName: string) => {
    setSelectedDrug(drugName);
    const drug = pediatricDrugs.find(d => d.name === drugName);
    const currentWeight = parseFloat(weightInput || '0');
    
    if (drug && currentWeight > 0) {
      const dose = (currentWeight * drug.factor).toFixed(1);
      const resultText = `الجرعة المقترحة: ${dose} مل زجاجة، ${drug.note}`;
      setCalculatedDose(resultText);
      // إضافة النص تلقائياً إلى خانة الروشتة لتوفير الوقت على الطبيب
      setPrescription(prev => prev ? `${prev}\n- ${drugName}: ${dose} مل` : `- ${drugName}: ${dose} مل`);
    }
  };

  // حفظ الكشف والروشتة في قاعدة البيانات وتحديث الزيارة الحالية
  const handleSaveVisit = async () => {
    if (!complaint || !diagnosis) {
      alert('الرجاء إدخال الشكوى المرضية والتشخيص أولاً');
      return;
    }
    setSaveLoading(true);
    
    // تحديث آخر زيارة جارية (serving) أو إضافة سجل جديد
    const currentVisitId = selectedVisit?.id;
    
    const { error } = await supabase
      .from('clinic_appointments')
      .update({
        complaint: complaint,
        diagnosis: diagnosis,
        prescription: prescription,
        status: 'completed' // إغلاق الكشف بنجاح
      })
      .eq('id', currentVisitId);

    if (!error) {
      setSuccessMsg('تم حفظ وتوثيق الروشتة وإغلاق التذكرة بنجاح!');
      setTimeout(() => setSuccessMsg(''), 4000);
    }
    setSaveLoading(false);
  };

  if (loading) return <p className="text-center text-xs text-slate-400 py-12">جاري تحميل السجل الطبي الكامل للطفل...</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right" dir="rtl">
      
      {/* العمود الأيمن: بيانات الطفل الحالية المسجلة بواسطة المساعد */}
      <div className="space-y-6 lg:col-span-1">
        <div className="bg-white dark:bg-slate-900 border border-slate-100 rounded-3xl p-5 shadow-2xs">
          <div className="flex items-center gap-3 border-b pb-4 mb-4">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl"><User className="h-5 w-5" /></div>
            <div>
              <h2 className="text-base font-black text-slate-800 dark:text-white">{patient?.full_name}</h2>
              <p className="text-[11px] text-slate-400 font-bold">ملف طبي رقم: #{patient?.id.slice(0,5)}</p>
            </div>
          </div>

          {/* المؤشرات الحيوية التي أدخلها المساعد */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl flex items-center gap-2">
              <Weight className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-[10px] text-slate-400">الوزن الحالي</p>
                <p className="text-xs font-bold font-mono text-slate-800 dark:text-slate-100">{patient?.weight || '--'} كجم</p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-rose-500" />
              <div>
                <p className="text-[10px] text-slate-400">الحرارة</p>
                <p className="text-xs font-bold font-mono text-slate-800 dark:text-slate-100">{patient?.temperature || '--'} °م</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 border-t pt-3">
            <p>👶 **العمر الحالي:** {patient?.age_years} سنة و {patient?.age_months} شهر</p>
            <p>📞 **هاتف الوالد:** <span className="font-mono">{patient?.parent_phone || 'لا يوجد'}</span></p>
            <p>📝 **ملاحظات الحساسية:** <span className="text-rose-500 font-bold">{patient?.allergies || 'لا توجد حساسية معروفة'}</span></p>
          </div>
        </div>

        {/* قائمة تاريخ الزيارات السابقة */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 rounded-3xl p-5 shadow-2xs">
          <h3 className="text-xs font-black text-slate-400 uppercase mb-3 tracking-wider">تاريخ ومواعيد الزيارات السابقة:</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {appointments.length === 0 ? (
              <p className="text-center text-[11px] text-slate-400 py-4">لا توجد زيارات سابقة مسجلة.</p>
            ) : (
              appointments.map((visit) => (
                <button
                  key={visit.id}
                  type="button"
                  onClick={() => {
                    setSelectedVisit(visit);
                    setComplaint(visit.complaint || '');
                    setDiagnosis(visit.diagnosis || '');
                    setPrescription(visit.prescription || '');
                  }}
                  className={`w-full text-right p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${selectedVisit?.id === visit.id ? 'border-teal-500 bg-teal-50/40 text-teal-700' : 'border-slate-100 hover:bg-slate-50'}`}
                >
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-slate-400" />
                    <span>{new Date(visit.created_at).toLocaleDateString('ar-EG')}</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-500">
                    {visit.type === 'checkup' ? '🩺 كشف' : '🔄 استشارة'}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      {/* العمود الأيسر: عرض تفاصيل الزيارة المحددة + كتابة الروشتة الحالية */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* حاسبة الجرعات والروشتة المدمجة الذكية لمنع أخطاء الـ Build */}
        <div className="bg-white dark:bg-slate-900 border border-slate-100 rounded-3xl p-6 shadow-2xs">
          <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-1.5 mb-5">
            <Calculator className="h-5 w-5 text-teal-600" />
            <span>لوحة الفحص الذكي وحساب جرعات الأطفال</span>
          </h3>

          {/* الحاسبة الفورية المقترنة بوزن الطفل الحالي */}
          <div className="bg-slate-50 dark:bg-slate-800/40 p-4 rounded-2xl mb-6">
            <label className="block text-xs font-bold text-slate-500 mb-2">اختر الدواء لحساب جرعته الآمنة للطفل فورا:</label>
            <div className="flex flex-wrap gap-2">
              {pediatricDrugs.map(drug => (
                <button
                  key={drug.name}
                  type="button"
                  onClick={() => handleCalculate(drug.name)}
                  className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all ${selectedDrug === drug.name ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-800 text-slate-700 border-slate-200 hover:border-slate-300'}`}
                >
                  {drug.name.split(' ')[0]}
                </button>
              ))}
            </div>
            {calculatedDose && (
              <div className="mt-3 p-3 bg-teal-50 dark:bg-teal-950/40 border border-teal-100 text-teal-800 dark:text-teal-400 text-xs rounded-xl font-bold">
                {calculatedDose}
              </div>
            )}
          </div>

          {/* مدخلات الكشف الطبي الفعلي */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">الشكوى والأعراض الحالية (Complaint):</label>
              <textarea
                rows={2}
                value={complaint}
                onChange={(e) => setComplaint(e.target.value)}
                placeholder="اكتب الأعراض أو شكوى والدة الطفل..."
                className="w-full bg-slate-50 dark:bg-slate-800 border p-3 text-xs rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">التشخيص الطبي (Diagnosis):</label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="مثال: Acute Tonsillitis / Gastroenteritis"
                className="w-full bg-slate-50 dark:bg-slate-800 border p-3 text-xs rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 mb-1.5">الروشتة وخطة العلاج الرقمية (Prescription):</label>
              <textarea
                rows={4}
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="تظهر الأدوية المحسوبة هنا تلقائياً، وبإمكانك التعديل عليها أو إضافة أدوية أخرى حرّة..."
                className="w-full bg-slate-50 dark:bg-slate-800 border p-3 text-xs font-mono rounded-xl focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-white"
              />
            </div>

            {/* زر الحفظ النهائي */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleSaveVisit}
                disabled={saveLoading}
                className="w-full sm:w-auto px-6 py-2.5 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm"
              >
                {saveLoading ? 'جاري حفظ وثيقة الكشف...' : 'اعتماد وحفظ الروشتة وإغلاق الكشف'}
              </button>
              
              {successMsg && (
                <div className="text-xs text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100">
                  <Check className="h-4 w-4" />
                  <span>{successMsg}</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
