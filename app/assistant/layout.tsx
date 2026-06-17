'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  UserPlus, 
  Clock, 
  Receipt, 
  LogOut, 
  Menu, 
  X,
  UserCheck
} from 'lucide-react';

export default function AssistantLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // الأزرار الخاصة بصلاحيات المساعد (السكرتارية)
  const menuItems = [
    { name: 'لوحة التحكم الرئيسية', href: '/assistant/dashboard', icon: LayoutDashboard },
    { name: 'تسجيل طفل جديد', href: '/assistant/patients/new', icon: UserPlus },
    { name: 'الطابور والانتظار الحي', href: '/assistant/queue', icon: Clock },
    { name: 'خزينة الفواتير والحسابات', href: '/assistant/billing', icon: Receipt },
  ];

  // دالة تسجيل الخروج الآمنة وحذف الكوكيز من السيرفر والعميل
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
      
      {/* شريط الموبايل العلوي */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-teal-600" />
          <span className="font-black text-slate-800 dark:text-white text-base">PediaCare Desk</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* القائمة الجانبية للمساعد */}
      <aside className={`
        fixed inset-y-0 right-0 z-40 w-64 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 p-5 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 md:static md:h-screen
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        
        <div className="space-y-6">
          {/* شعار مكتب الاستقبال */}
          <div className="hidden md:flex items-center gap-2.5 border-b border-slate-50 dark:border-slate-800/60 pb-5">
            <div className="p-2 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl">
              <UserCheck className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 dark:text-white text-sm">مكتب الاستقبال</h2>
              <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold mt-0.5">إدارة الحالات والحسابات</p>
            </div>
          </div>

          {/* التنقل */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                    isActive 
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/10' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400 dark:text-slate-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* زر الخروج السفلي */}
        <div className="pt-4 border-t border-slate-50 dark:border-slate-800/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
          >
            <LogOut className="h-4 w-4 text-rose-500" />
            <span>تسجيل الخروج الآمن</span>
          </button>
        </div>

      </aside>

      {/* غطاء الخلفية للموبايل */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* منطقة المحتوى الفعلي للمساعد */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}
