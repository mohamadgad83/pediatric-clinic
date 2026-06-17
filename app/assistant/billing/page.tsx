'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { DollarSign, Receipt, CreditCard, Search, Check, RefreshCw } from 'lucide-react';

export default function AssistantBilling() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // جلب الفواتير غير المدفوعة أو اليومية فوراً من السوبابيز
  const fetchInvoices = async () => {
    setLoading(true);
    // تذكر استبدال 'clinic_invoices' باسم جدولك الفعلي وتضمين ربط اسم المريض
    const { data, error } = await supabase
      .from('clinic_invoices')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) setInvoices(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  // تحديث حالة الفاتورة لـ "مدفوعة" بضغطة زر واحدة عند استلام النقدية
  const handleMarkAsPaid = async (invoiceId: string) => {
    const { error } = await supabase
      .from('clinic_invoices')
      .update({ status: 'paid' })
      .match({ id: invoiceId });

    if (!error) {
      // تحديث الواجهة محلياً لتوفير سرعة فائقة للمساعد
      setInvoices(invoices.map(inv => inv.id === invoiceId ? { ...inv, status: 'paid' } : inv));
    }
  };

  // احتساب إجمالي دخل اليومية المعروض أمام السكرتارية
  const totalDailyEarnings = invoices
    .filter(inv => inv.status === 'paid')
    .reduce((sum, inv) => sum + Number(inv.amount), 0);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-right" dir="rtl">
      
      {/* قسم الإحصائيات المالية السريع */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        
        <div className="bg-gradient-to-br from-teal-600 to-emerald-600 rounded-2xl p-5 text-white shadow-lg shadow-teal-600/10 flex items-center justify-between">
          <div>
            <p className="text-white/80 text-xs font-bold">إجمالي نقدية اليومية المحصلة</p>
            <h3 className="text-2xl font-black mt-2 font-mono">{totalDailyEarnings} ج.م</h3>
          </div>
          <div className="p-3 bg-white/10 rounded-xl">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">فواتير بانتظار التحصيل</p>
            <h3 className="text-2xl font-black mt-2 font-mono text-amber-500">
              {invoices.filter(i => i.status === 'unpaid').length} فواتير
            </h3>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 text-amber-500 rounded-xl">
            <Receipt className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-xs sm:col-span-2 lg:col-span-1">
          <div>
            <p className="text-slate-500 dark:text-slate-400 text-xs font-bold">العمليات المكتملة بنجاح</p>
            <h3 className="text-2xl font-black mt-2 font-mono text-emerald-500">
              {invoices.filter(i => i.status === 'paid').length} فاتورة
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-xl">
            <Check className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* لوحة التحكم والجدول الرئيسي للفواتير */}
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-72">
            <Search className="absolute right-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="البحث برقم الفاتورة أو اسم الطفل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pr-9 pl-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 text-slate-800 dark:text-slate-100"
            />
          </div>

          <button 
            onClick={fetchInvoices}
            className="p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all flex items-center gap-1 text-xs font-bold self-end sm:self-center"
          >
            <RefreshCw className="h-4 w-4" />
            <span>تحديث يدوي</span>
          </button>
        </div>

        {/* جدول الفواتير التفاعلي */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-xs text-slate-400 font-bold">
                <th className="pb-3 pl-2">رقم الفاتورة</th>
                <th className="pb-3 px-2">نوع الخدمة</th>
                <th className="pb-3 px-2">المبلغ الكلي</th>
                <th className="pb-3 px-2">حالة السداد</th>
                <th className="pb-3 pr-2 text-left">الإجراء السريع</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60 text-xs text-slate-700 dark:text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">جاري تحميل المعاملات المالية الحية...</td>
                </tr>
              ) : invoices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">لا توجد فواتير مسجلة لليوم بعد.</td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 pl-2 font-mono font-bold text-slate-900 dark:text-white">#{inv.invoice_number || '1024'}</td>
                    <td className="py-3.5 px-2">
                      <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md font-medium">
                        {inv.type === 'checkup' ? '🩺 كشف جديد' : '🔄 استشارة طبي'}
                      </span>
                    </td>
                    <td className="py-3.5 px-2 font-mono font-bold text-slate-800 dark:text-slate-100">{inv.amount} ج.م</td>
                    <td className="py-3.5 px-2">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        inv.status === 'paid' 
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400' 
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400'
                      }`}>
                        {inv.status === 'paid' ? 'مدفوعة ومحصلة' : 'معلقة - لم تدفع'}
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 text-left">
                      {inv.status === 'unpaid' ? (
                        <button
                          onClick={() => handleMarkAsPaid(inv.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] transition-all"
                        >
                          💵 استلام النقدية الآن
                        </button>
                      ) : (
                        <span className="text-slate-400 font-medium">✓ تم إغلاقها</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
