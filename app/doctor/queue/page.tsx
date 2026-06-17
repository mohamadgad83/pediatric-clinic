'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Stethoscope, Play, CheckCircle2, UserCheck } from 'lucide-react';

export default function DoctorQueueRealTime() {
  const [activeQueue, setActiveQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDoctorQueue = async () => {
    setLoading(true);
    // جلب الحالات المحولة للطبيب والمستمرة بالانتظار
    const { data, error } = await supabase
      .from('clinic_appointments')
      .select('id, token_number, status, patient_id, clinic_patients(full_name, age_months, age_years)')
      .in('status', ['waiting', 'serving'])
      .order('status', { ascending: false }) // جعل الحالات الجاري فحصها بالأعلى
      .order('token_number', { ascending: true });

    if (data) setActiveQueue(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchDoctorQueue();

    // الاستماع الفوري للتعديلات المفرزة من المساعد بالخارج
    const doctorChannel = supabase
      .channel('doctor-live-queue')
      .on(
        'postgres_changes',
        { event: '*', filter: 'status=in.(waiting,serving,completed)', schema: 'public', table: 'clinic_appointments' },
        () => {
          fetchDoctorQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(doctorChannel);
    };
  }, []);

  // إنهاء الكشف وتحويل الحالة لمكتملة
  const handleCompleteCheckup = async (appointmentId: string) => {
    await supabase
      .from('clinic_appointments')
      .update({ status: 'completed' })
      .match({ id: appointmentId });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-right" dir="rtl">
      
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 mb-8">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Stethoscope className="h-6 w-6 text-teal-600" />
            <span>شاشة الحالات الحالية للطبيب</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تحديث لحظي ومباشر للحالات التي يوجهها المساعد من الخارج.</p>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-xs text-slate-400 py-12">جاري تحديث لوحة الكشف الحية...</p>
      ) : activeQueue.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 text-slate-400 text-xs">
          لا يوجد أطفال محولين للكشف حالياً في الانتظار.
        </div>
      ) : (
        <div className="space-y-3 max-w-4xl mx-auto">
          {activeQueue.map((item) => {
            const isServing = item.status === 'serving';
            return (
              <div 
                key={item.id}
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  isServing 
                    ? 'border-teal-500 shadow-sm ring-1 ring-teal-500/20 bg-gradient-to-l from-teal-50/20 via-transparent to-transparent' 
                    : 'border-slate-100 dark:border-slate-800 opacity-75'
                }`}
              >
                
                {/* البيانات الأساسية للطفل */}
                <div className="flex items-center gap-4">
                  <div className={`h-11 w-11 font-mono font-black rounded-xl flex items-center justify-center text-sm ${
                    isServing ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}>
                    {String(item.token_number).padStart(2, '0')}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      {item.clinic_patients?.full_name}
                      {isServing && (
                        <span className="text-[10px] bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-400 px-2 py-0.5 rounded-md font-medium flex items-center gap-1 animate-pulse">
                          <UserCheck className="h-3 w-3" />
                          الحالة الحالية
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      عمر الطفل: {item.clinic_patients?.age_years} سنة و {item.clinic_patients?.age_months} شهر
                    </p>
                  </div>
                </div>

                {/* أزرار التحكم الفوري للطبيب */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isServing ? (
                    <>
                      <button
                        onClick={() => router.push(`/doctor/patients/${item.patient_id}`)}
                        className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Play className="h-3.5 w-3.5 fill-current" />
                        <span>فتح الملف والكشف</span>
                      </button>
                      
                      <button
                        onClick={() => handleCompleteCheckup(item.id)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span>إنهاء</span>
                      </button>
                    </>
                  ) : (
                    <span className="text-[11px] text-slate-400 font-medium pl-2">بانتظار توجيهه من المساعد...</span>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
