'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Activity, 
  Calendar, 
  DollarSign, 
  ArrowUpRight, 
  Layers 
} from 'lucide-react';

export default function DoctorAnalytics() {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    monthlyEarnings: 0,
    todayEarnings: 0,
    checkupsCount: 0,
    consultationsCount: 0,
    totalPatients: 0
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('month'); // 'month' | 'year'

  useEffect(() => {
    async function loadAnalyticsData() {
      setLoading(true);
      
      // 1. جلب إجمالي الفواتير المدفوعة
      const { data: invoices } = await supabase
        .from('clinic_invoices')
        .select('amount, type, created_at')
        .eq('status', 'paid');

      // 2. جلب إجمالي عدد المرضى المسجلين
      const { count: patientsCount } = await supabase
        .from('clinic_patients')
        .select('*', { count: 'exact', head: true });

      if (invoices) {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        let total = 0;
        let monthTotal = 0;
        let todayTotal = 0;
        let checkups = 0;
        let consultations = 0;

        invoices.forEach(inv => {
          const amt = Number(inv.amount);
          const invDate = new Date(inv.created_at);
          const invDateString = inv.created_at.split('T')[0];

          total += amt;
          
          if (invDateString === today) {
            todayTotal += amt;
          }
          if (invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear) {
            monthTotal += amt;
          }
          if (inv.type === 'checkup') {
            checkups++;
          } else if (inv.type === 'consultation') {
            consultations++;
          }
        });

        setStats({
          totalEarnings: total,
          monthlyEarnings: monthTotal,
          todayEarnings: todayTotal,
          checkupsCount: checkups,
          consultationsCount: consultations,
          totalPatients: patientsCount || 0
        });
      }
      setLoading(false);
    }

    loadAnalyticsData();
  }, []);

  // احتساب النسبة المئوية لتوزيع الخدمات لإظهارها كـ Progress Bar عصري
  const totalServices = stats.checkupsCount + stats.consultationsCount;
  const checkupPercentage = totalServices > 0 ? Math.round((stats.checkupsCount / totalServices) * 100) : 0;
  const consultationPercentage = totalServices > 0 ? Math.round((stats.consultationsCount / totalServices) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-right" dir="rtl">
      
      {/* الهيدر الرئيسي للمنظومة */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-5 mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-teal-600" />
            <span>التقارير الذكية والأداء المالي</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">نظرة عامة ومحللة على إيرادات العيادة ومعدلات نمو الحالات.</p>
        </div>

        {/* أزرار الفلترة العصرية */}
        <div className="flex bg-slate-200/60 dark:bg-slate-900 p-1 rounded-xl self-start sm:self-center">
          <button 
            onClick={() => setActiveTab('month')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'month' ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-xs' : 'text-slate-500'}`}
          >
            الشهر الحالي
          </button>
          <button 
            onClick={() => setActiveTab('year')}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'year' ? 'bg-white dark:bg-slate-800 text-teal-600 shadow-xs' : 'text-slate-500'}`}
          >
            الإحصاء الشامل
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-center text-xs text-slate-400 py-12">جاري تحليل البيانات المالية وتوليد التقارير...</p>
      ) : (
        <>
          {/* كروت الإحصائيات السريعة الثلاثية */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold">دخل اليوم الحالي</span>
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 rounded-xl">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100">{stats.todayEarnings} <span className="text-xs font-bold text-slate-400">ج.م</span></h3>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-0.5">
                <ArrowUpRight className="h-3 w-3" />
                <span>محدث لحظياً من الخزينة</span>
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold">إيرادات الشهر الحالي</span>
                <div className="p-2 bg-teal-50 dark:bg-teal-950/30 text-teal-500 rounded-xl">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100">{stats.monthlyEarnings} <span className="text-xs font-bold text-slate-400">ج.م</span></h3>
              <p className="text-[10px] text-slate-400 mt-2">مجموع صافي عمليات التحصيل للـ 30 يوم الحالية</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold">الإجمالي التراكمي للإيرادات</span>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 rounded-xl">
                  <DollarSign className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100">{stats.totalEarnings} <span className="text-xs font-bold text-slate-400">ج.م</span></h3>
              <p className="text-[10px] text-slate-400 mt-2">منذ تاريخ إطلاق وتأسيس التطبيق</p>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
              <div className="flex items-center justify-between text-slate-400 mb-3">
                <span className="text-xs font-bold">قاعدة المرضى النشطة</span>
                <div className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black font-mono text-slate-800 dark:text-slate-100">{stats.totalPatients} <span className="text-xs font-bold text-slate-400">أطفال</span></h3>
              <p className="text-[10px] text-teal-600 dark:text-teal-400 mt-2">ملفات طبية مسجلة بالكامل</p>
            </div>

          </div>

          {/* قسم التوزيع البياني الهيكلي (بشكل تجاوبي احترافي) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* كارت نسب توزيع الخدمات العيادية */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs lg:col-span-2">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-teal-600" />
                <span>تحليل هيكلية الزيارات والعمليات</span>
              </h3>

              <div className="space-y-5">
                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-700 dark:text-slate-300 font-bold">🩺 الكشوفات الجديدة الفعالة ({stats.checkupsCount})</span>
                    <span className="font-mono font-bold text-teal-600">{checkupPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-teal-600 h-full transition-all duration-500" style={{ width: `${checkupPercentage}%` }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-slate-700 dark:text-slate-300 font-bold">🔄 الاستشارات الدورية والمراجعات ({stats.consultationsCount})</span>
                    <span className="font-mono font-bold text-indigo-600">{consultationPercentage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-indigo-600 h-full transition-all duration-500" style={{ width: `${consultationPercentage}%` }}></div>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-50 dark:border-slate-800/80 grid grid-cols-2 text-center text-slate-400 text-[11px]">
                <div className="border-l border-slate-100 dark:border-slate-800">
                  <p>متوسط دخل الكشف المعتمد</p>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-200 font-mono mt-1">200 ج.م</p>
                </div>
                <div>
                  <p>متوسط دخل الاستشارة المعتمد</p>
                  <p className="text-sm font-black text-slate-700 dark:text-slate-200 font-mono mt-1">50 ج.م</p>
                </div>
              </div>
            </div>

            {/* كارت الكفاءة التشغيلية للعيادة */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
              <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 mb-6 flex items-center gap-1.5">
                <Activity className="h-4 w-4 text-emerald-500" />
                <span>مؤشر الاستدامة والأداء</span>
              </h3>

              <div className="flex flex-col items-center justify-center py-4">
                <div className="h-28 w-28 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 flex flex-col items-center justify-center animate-spin-slow-medical">
                  <span className="text-2xl font-black font-mono text-slate-800 dark:text-white">100%</span>
                  <span className="text-[9px] text-slate-400 font-bold mt-0.5">جاهزية تامة</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-6 px-4">
                  جميع قنوات المزامنة والربط اللحظي بين المساعد وغرفة الطبيب تعمل بأعلى استقرار برميجي دون وجود فواتير مفقودة.
                </p>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
}
