'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Stethoscope,
  ClipboardList,
  ArrowRight
} from 'lucide-react';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'الرئيسية (Dashboard)', href: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'قائمة الانتظار الحية', href: '/doctor/queue', icon: Clock },
    { name: 'أرشيف وملفات المرضى', href: '/doctor/patients', icon: Users },
    { name: 'تقرير نشاط المساعد', href: '/doctor/assistant-reports', icon: ClipboardList },
    { name: 'التقارير المالية والتحليلات', href: '/doctor/analytics', icon: BarChart3 },
    { name: 'إعدادات العيادة', href: '/doctor/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        localStorage.clear();
        router.refresh();
        router.push('/login');
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row-reverse" dir="rtl">
      
      {/* هيدر الموبايل */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-teal-600" />
          <span className="font-black text-slate-800 dark:text-white text-base">PediaCare Pro</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600 rounded-xl">
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* القائمة الجانبية الثابتة */}
      <aside className={`fixed inset-y-0 right-0 z-40 w-64 bg-white dark:bg-slate-900 border-l border-slate-100 p-5 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 md:static md:h-screen ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="space-y-6">
          <div className="hidden md:flex items-center gap-2.5 border-b pb-5">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl"><Stethoscope className="h-6 w-6" /></div>
            <div>
              <h2 className="font-black text-slate-800 dark:text-white text-sm">منظومة د. أطفال</h2>
              <p className="text-[10px] text-teal-600 font-bold">لوحة التحكم العليا</p>
            </div>
          </div>

          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} onClick={() => setIsSidebarOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-teal-600 text-white shadow-md' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="pt-4 border-t">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-all">
            <LogOut className="h-4 w-4" />
            <span>تسجيل الخروج من المنظومة</span>
          </button>
        </div>
      </aside>

      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-slate-900/40 z-30 md:hidden" />}

      {/* منطقة المحتوى الرئيسي وزر العودة الذكي */}
      <main className="flex-1 min-h-screen overflow-y-auto p-4 md:p-8">
        {pathname !== '/doctor/dashboard' && (
          <button onClick={() => router.back()} className="mb-4 flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-600 transition-all bg-white dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-100 shadow-2xs">
            <ArrowRight className="h-4 w-4" />
            <span>رجوع للخلف</span>
          </button>
        )}
        {children}
      </main>
    </div>
  );
}
