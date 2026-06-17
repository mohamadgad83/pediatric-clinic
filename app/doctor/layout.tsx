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
  Stethoscope
} from 'lucide-react';

export default function DoctorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // قائمة العناصر الجانبية لربط الصفحات التي قمنا بإنشائها وتطويرها
  const menuItems = [
    { name: 'الرئيسية (Dashboard)', href: '/doctor/dashboard', icon: LayoutDashboard },
    { name: 'قائمة الانتظار الحية', href: '/doctor/queue', icon: Clock },
    { name: 'ملفات المرضى الأطفال', href: '/doctor/patients', icon: Users },
    { name: 'التقارير المالية والتحليلات', href: '/doctor/analytics', icon: BarChart3 },
    { name: 'إعدادات التحكم بالعيادة', href: '/doctor/settings', icon: Settings },
  ];

  // دالة تسجيل الخروج الآمنة المرتبطة بالـ API والـ Middleware المحمي
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        localStorage.clear(); // تنظيف بيانات العميل
        router.refresh();
        router.push('/login'); // التوجيه لصفحة الدخول مؤمناً بالكامل
      }
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col md:flex-row-reverse" dir="rtl">
      
      {/* هيدر الموبايل (Responsive Top Bar) */}
      <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between z-50">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-6 w-6 text-teal-600" />
          <span className="font-black text-slate-800 dark:text-white text-base">PediaCare Pro</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* القائمة الجانبية الثابتة والمتحركة (Sidebar) */}
      <aside className={`
        fixed inset-y-0 right-0 z-40 w-64 bg-white dark:bg-slate-900 border-l border-slate-100 dark:border-slate-800 p-5 flex flex-col justify-between transform transition-transform duration-300 md:translate-x-0 md:static md:h-screen
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        
        <div className="space-y-6">
          {/* الهوية البصرية والشعار */}
          <div className="hidden md:flex items-center gap-2.5 border-b border-slate-50 dark:border-slate-800/60 pb-5">
            <div className="p-2 bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 rounded-xl">
              <Stethoscope className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-black text-slate-800 dark:text-white text-sm">منظومة د. أطفال</h2>
              <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold mt-0.5">لوحة التحكم العليا</p>
            </div>
          </div>

          {/* عناصر القائمة */}
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

        {/* زر تسجيل الخروج المحمي أسفل القائمة */}
        <div className="pt-4 border-t border-slate-50 dark:border-slate-800/60">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
          >
            <LogOut className="h-4 w-4 text-rose-500" />
            <span>تسجيل الخروج من المنظومة</span>
          </button>
        </div>

      </aside>

      {/* خلفية معتمة عند فتح القائمة في الموبايل */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)} 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* منطقة عرض المحتوى الرئيسي المتغير */}
      <main className="flex-1 min-h-screen overflow-y-auto">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>

    </div>
  );
}
