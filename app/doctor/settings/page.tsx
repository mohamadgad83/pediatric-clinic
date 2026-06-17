'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; // تأكد من مسار السوبابيز لديك

export default function DoctorSettings() {
  const [fees, setFees] = useState({ checkup: 200, consultation: 50 });
  const [isClinicOpen, setIsClinicOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // جلب الإعدادات الحالية عند تحميل الصفحة
  useEffect(() => {
    async function fetchSettings() {
      const { data, error } = await supabase.from('clinic_settings').select('*').single();
      if (data) {
        setFees({ checkup: data.checkup_fees, consultation: data.consultation_fees });
        setIsClinicOpen(data.is_clinic_open);
      }
    }
    fetchSettings();
  } [], []);

  const handleSaveSettings = async () => {
    setLoading(true);
    setMessage('');
    
    const { error } = await supabase
      .from('clinic_settings')
      .update({
        checkup_fees: fees.checkup,
        consultation_fees: fees.consultation,
        is_clinic_open: isClinicOpen,
        updated_at: new Date().toISOString(),
      })
      .match({ id: 'معرف_الاعدادات_او_تعديل_السطر_الوحيد' }); // تعديل حسب منطق المعرف لديك

    setLoading(false);
    if (!error) {
      setMessage('✅ تم تحديث الإعدادات بنجاح، وتطبيق التغييرات فوراً في نظام المساعد!');
    } else {
      setMessage('❌ حدث خطأ أثناء الحفظ، يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 text-right" dir="rtl">
      {/* الهيدر مع الهوية البصرية */}
      <div className="mb-8 border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 font-sans">لوحة التحكم المطلق وإعدادات العيادة</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">هنا يمكنك إدارة المنظومة المالية وحالة العمل بالعيادة وتنعكس فوراً على واجهة المساعد.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* كارت التحكم الفوري بحالة العيادة */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
          <div className="flex items-center justify-between mb-6">
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${isClinicOpen ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
              {isClinicOpen ? 'مفتوحة الآن' : 'مغلقة مؤقتاً'}
            </span>
            <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">تدفق العيادة (Live Flow)</h3>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-xs mb-4">بإغلاق العيادة، سيتم تنبيه المساعد بالخارج للتوقف عن إدخال حالات جديدة في قائمة الانتظار مؤقتاً.</p>
          <button
            onClick={() => setIsClinicOpen(!isClinicOpen)}
            className={`w-full py-3 rounded-xl font-bold transition-all ${
              isClinicOpen 
                ? 'bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/30 dark:text-rose-400' 
                : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400'
            }`}
          >
            {isClinicOpen ? '🛑 إيقاف استقبال الحالات مؤقتاً' : '🟢 تفعيل استقبال الحالات الآن'}
          </button>
        </div>

        {/* كارت الإدارة المالية والتسعير */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
          <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-6">هيكلة الأسعار والرسوم</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-slate-600 dark:text-slate-400 text-sm mb-2">قيمة الكشف الافتراضية (جنيه)</label>
              <input
                type="number"
                value={fees.checkup}
                onChange={(e) => setFees({ ...fees, checkup: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-600 dark:text-slate-400 text-sm mb-2">قيمة الاستشارة الافتراضية (جنيه)</label>
              <input
                type="number"
                value={fees.consultation}
                onChange={(e) => setFees({ ...fees, consultation: Number(e.target.value) })}
                className="w-full bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded-xl px-4 py-2.5 text-left focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100 font-mono"
              />
            </div>
          </div>
        </div>

      </div>

      {/* زر الحفظ العائم والمؤشرات */}
      <div className="mt-8 flex flex-col items-center justify-between border-t border-slate-200 dark:border-slate-800 pt-6 sm:flex-row">
        <p className="text-sm font-semibold text-teal-600 dark:text-teal-400 mb-4 sm:mb-0">{message}</p>
        <button
          onClick={handleSaveSettings}
          disabled={loading}
          className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-teal-600/20 active:scale-95 disabled:opacity-50"
        >
          {loading ? 'جاري حفظ التعديلات...' : '💾 حفظ الإعدادات وتعميمها'}
        </button>
      </div>
    </div>
  );
}
