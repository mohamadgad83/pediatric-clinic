'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { ClipboardList, CheckCircle, UserPlus, Receipt } from 'lucide-react';

export default function AssistantDailyReports() {
  const [reportData, setReportData] = useState({ patientsAdded: [], invoicesCollected: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssistantDailyActivity() {
      setLoading(true);
      const todayStart = new Date();
      todayStart.setHours(0,0,0,0);

      // 1. جلب المرضى الذين تم تسجيلهم اليوم بواسطة المساعد
      const { data: patients } = await supabase
        .from('clinic_patients')
        .select('*')
        .gte('created_at', todayStart.toISOString());

      // 2. جلب الفواتير التي تم تحصيلها اليوم بالخزنة
      const { data: invoices } = await supabase
        .from('clinic_invoices')
        .select('*')
        .eq('status', 'paid')
        .gte('created_at', todayStart.toISOString());

      setReportData({
        patientsAdded: patients || [],
        invoicesCollected: invoices || []
      });
      setLoading(false);
    }
    loadAssistantDailyActivity();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-6 text-right" dir="rtl">
      <div className="mb-6">
        <h1 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <ClipboardList className="h-5 w-5 text-teal-600" />
          <span>تقرير الكفاءة والنشاط اليومي للمساعد</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">يعرض الإجراءات المالية والملفات التي أنجزها موظف الاستقبال خلال اليوم الحالي.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* الأطفال المسجلين اليوم */}
        <div className="bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-xs">
          <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-4 border-b pb-2">
            <UserPlus className="h-4 w-4 text-blue-500" />
            <span>ملفات الأطفال المضافة حديثاً ({reportData.patientsAdded.length})</span>
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {reportData.patientsAdded.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">لم يقم المساعد بإضافة ملفات جديدة اليوم.</p>
            ) : (
              reportData.patientsAdded.map((p: any) => (
                <div key={p.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-800 dark:text-white">{p.full_name}</span>
                  <span className="text-slate-400 font-mono">{new Date(p.created_at).toLocaleTimeString('ar-EG')}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* المبالغ المحصلة في الخزنة اليوم */}
        <div className="bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-xs">
          <h3 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-4 border-b pb-2">
            <Receipt className="h-4 w-4 text-emerald-500" />
            <span>الفواتير والرسوم المحصلة في الخزينة ({reportData.invoicesCollected.length})</span>
          </h3>
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {reportData.invoicesCollected.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">لا توجد عمليات سداد مسجلة اليوم.</p>
            ) : (
              reportData.invoicesCollected.map((inv: any) => (
                <div key={inv.id} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-600">+{inv.amount} ج.م ({inv.type === 'checkup' ? 'كشف' : 'استشارة'})</span>
                  <span className="text-slate-400 font-mono">{new Date(inv.created_at).toLocaleTimeString('ar-EG')}</span>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
