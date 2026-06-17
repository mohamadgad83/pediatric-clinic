'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, UserCheck, Clock, ArrowLeft, AlertCircle } from 'lucide-react';

export default function AssistantQueueRealTime() {
  const [queue, setQueue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // دالة جلب البيانات الأساسية عند التحميل
  const fetchInitialQueue = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('clinic_appointments')
      .select('id, token_number, status, clinic_patients(full_name, age_months, age_years)')
      .in('status', ['waiting', 'serving'])
      .order('token_number', { ascending: true });

    if (data) setQueue(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInitialQueue();

    // السحر هنا: الاشتراك اللحظي في قنوات سوبابيز (Realtime Subscription)
    const queueChannel = supabase
      .channel('assistant-live-queue')
      .on(
        'postgres_changes',
        { event: '*', filter: 'status=in.(waiting,serving,completed)', schema: 'public', table: 'clinic_appointments' },
        (payload) => {
          // إعادة جلب ذكية وسريعة فور حدوث أي تعديل من الطبيب أو المساعد الآخر
          fetchInitialQueue();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(queueChannel);
    };
  }, []);

  // دالة توجيه الحالة لغرفة الطبيب (تحديث الحالة إلى serving)
  const sendToDoctor = async (appointmentId: string) => {
    await supabase
      .from('clinic_appointments')
      .update({ status: 'serving' })
      .match({ id: appointmentId });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-right" dir="rtl">
      
      {/* الهيدر وعلامة الحالة الحية */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-5 mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Users className="h-6 w-6 text-teal-600" />
            <span>غرفة التحكم الحية في الطابور</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">تظهر التحديثات هنا وفي شاشة الطبيب لحظياً دون الحاجة لإعادة تحميل الصفحة.</p>
        </div>
        
        {/* مؤشر الاتصال اللحظي */}
        <div className="flex items-center gap-2 self-start sm:self-center bg-teal-50 dark:bg-teal-950/40 px-4 py-2 rounded-xl border border-teal-100/50 dark:border-teal-900/30">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400">مُتصل حياً بقاعدة البيانات</span>
        </div>
      </div>

      {/* عرض الطابور الحالي بكروت عصرية */}
      {loading ? (
        <p className="text-center text-xs text-slate-400 py-12">جاري مزامنة قائمة الانتظار الحية...</p>
      ) : queue.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 p-6">
          <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-700 dark:text-slate-300">لا يوجد أطفال في قائمة الانتظار حالياً</p>
          <p className="text-xs text-slate-400 mt-1">بإمكانك إضافة مريض جديد من لوحة التحكم ليدخل الطابور فوراً.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {queue.map((item) => {
            const isServing = item.status === 'serving';
            return (
              <div 
                key={item.id} 
                className={`bg-white dark:bg-slate-900 border rounded-2xl p-5 shadow-xs transition-all relative overflow-hidden ${
                  isServing 
                    ? 'border-teal-500 ring-2 ring-teal-500/10' 
                    : 'border-slate-100 dark:border-slate-800 hover:shadow-md'
                }`}
              >
                {/* رقم الدور المميز بالخلفية */}
                <div className="absolute left-4 top-4 text-3xl font-black font-mono text-slate-100 dark:text-slate-800/60 select-none">
                  {String(item.token_number).padStart(2, '0')}
                </div>

                <div className="flex flex-col h-full justify-between">
                  <div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isServing ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-400' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-400'
                    }`}>
                      {isServing ? '⚡ داخل العيادة الآن' : '⏳ منتظر بالخارج'}
                    </span>

                    <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mt-3 pl-12 line-clamp-1">
                      {item.clinic_patients?.full_name || 'طفل غير مسجل'}
                    </h3>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      العمر: {item.clinic_patients?.age_years} سنة و {item.clinic_patients?.age_months} شهر
                    </p>
                  </div>

                  {/* أزرار اتخاذ الإجراء السريع */}
                  <div className="mt-5 pt-3 border-t border-slate-50 dark:border-slate-800/80">
                    {!isServing ? (
                      <button
                        onClick={() => sendToDoctor(item.id)}
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98"
                      >
                        <span>توجيه لغرفة الكشف</span>
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </button>
                    ) : (
                      <div className="text-center py-2 text-teal-600 dark:text-teal-400 font-bold text-xs flex items-center justify-center gap-1 bg-teal-50/50 dark:bg-teal-950/20 rounded-xl">
                        <UserCheck className="h-4 w-4" />
                        <span>الطبيب يفحص الحالة حالياً</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
