'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import { User, Calendar, FileText, Activity, Thermometer, Weight } from 'lucide-react';
import SmartPrescription from '@/components/SmartPrescription'; // مساعد الجرعات المطور سابقاً

export default function PatientMedicalProfile() {
  const { id } = useParams();
  const [patient, setPatient] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPatientFullData() {
      setLoading(true);
      // 1. جلب بيانات الطفل الشخصية والحيوية الحالية
      const { data: patientData } = await supabase
        .from('clinic_patients')
        .select('*')
        .eq('id', id)
        .single();

      // 2. جلب سجل الزيارات السابق بالكامل
      const { data: visitsData } = await supabase
        .from('clinic_appointments')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false });

      if (patientData) setPatient(patientData);
      if (visitsData) {
        setAppointments(visitsData);
        if (visitsData.length > 0) setSelectedVisit(visitsData[0]); // فتح الزيارة الأخيرة تلقائياً
      }
      setLoading(false);
    }
    loadPatientFullData();
  }, [id]);

  if (loading) return <p className="text-center text-xs text-slate-400 py-12">جاري تحميل السجل الطبي الكامل للطفل...</p>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-right" dir="rtl">
      
      {/* العمود الأيمن: بيانات الطفل الحالية المسجلة بواسطة المساعد */}
      <div className="space-y-6 lg:col-span-1">
        <div className="bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-xs">
          <div className="flex items-center gap-3 border-b pb-4 mb-4">
            <div className="p-2.5 bg-teal-50 text-teal-600 rounded-xl"><User className="h-5 w-5" /></div>
            <div>
              <h2 className="text-base font-black text-slate-800 dark:text-white">{patient?.full_name}</h2>
              <p className="text-[11px] text-slate-400 font-bold">ملف طبي رقم: #{patient?.id.slice(0,5)}</p>
            </div>
          </div>

          {/* المؤشرات الحيوية التي أدخلها المساعد */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl flex items-center gap-2">
              <Weight className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-[10px] text-slate-400">الوزن الحالي</p>
                <p className="text-xs font-bold font-mono text-slate-800 dark:text-slate-100">{patient?.weight || '--'} كجم</p>
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-rose-500" />
              <div>
                <p className="text-[10px] text-slate-400">الحرارة</p>
                <p className="text-xs font-bold font-mono text-slate-800 dark:text-slate-100">{patient?.temperature || '--'} °م</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
            <p>👶 **العمر الحلي:** {patient?.age_years} سنة و {patient?.age_months} شهر</p>
            <p>📞 **هاتف الوالد:** <span className="font-mono">{patient?.parent_phone || 'لا يوجد'}</span></p>
            <p>📝 **ملاحظات الحساسية:** <span className="text-rose-500 font-bold">{patient?.allergies || 'لا توجد حساسية معروفة'}</span></p>
          </div>
        </div>

        {/* قائمة تاريخ الزيارات السابقة */}
        <div className="bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-xs">
          <h3 className="text-xs font-black text-slate-400 uppercase mb-3 tracking-wider">تاريخ ومواعيد الزيارات السابقة:</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {appointments.map((visit) => (
              <button
                key={visit.id}
                onClick={() => setSelectedVisit(visit)}
                className={`w-full text-right p-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-between ${selectedVisit?.id === visit.id ? 'border-teal-500 bg-teal-50/40 text-teal-700' : 'border-slate-100 hover:bg-slate-50'}`}
              >
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  <span>{new Date(visit.created_at).toLocaleDateString('ar-EG')}</span>
                </div>
                <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-md text-slate-500">
                  {visit.type === 'checkup' ? '🩺 كشف' : '🔄 استشارة'}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* العمود الأيسر: عرض تفاصيل الزيارة المحددة + كتابة الروشتة الجديدة */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* صندوق استعراض تفاصيل أي زيارة قديمة تم اختيارها */}
        {selectedVisit && (
          <div className="bg-amber-50/40 dark:bg-slate-900 border border-amber-200/60 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
            <h3 className="text-xs font-black text-amber-800 dark:text-amber-400 flex items-center gap-1.5 mb-3">
              <FileText className="h-4 w-4" />
              <span>بيانات وسجل الزيارة المحددة بتاريخ ({new Date(selectedVisit.created_at).toLocaleDateString('ar-EG')})</span>
            </h3>
            <div className="bg-white dark:bg-slate-800/40 rounded-xl p-4 text-xs space-y-2">
              <p className="text-slate-700 dark:text-slate-200">🩺 **الشكوى المرضية (Complaint):** {selectedVisit.complaint || 'لم تسجل شكوى بهذه الزيارة'}</p>
              <p className="text-slate-700 dark:text-slate-200">📝 **التشخيص الطبي (Diagnosis):** {selectedVisit.diagnosis || 'لا يوجد تشخيص مدون'}</p>
              <p className="text-teal-700 dark:text-teal-400 font-bold">💊 **الروشتة والعلاج المصروف:** {selectedVisit.prescription || 'لم يتم كتابة علاج رقمي'}</p>
            </div>
          </div>
        )}

        {/* مساعد الكشف والروشتة الجديدة للزيارة الحالية */}
        <SmartPrescription childWeight={patient?.weight} />
      </div>

    </div>
  );
}
